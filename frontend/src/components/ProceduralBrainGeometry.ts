import * as THREE from 'three';

/**
 * Procedural Top-View Anatomical Human Brain Geometry Generator
 * Generates 4 solid, anatomically specific 3D brain quadrants:
 * - Upper-Left & Upper-Right: Frontal & Superior Parietal Cortex
 * - Lower-Left & Lower-Right: Posterior Parietal & Occipital Cortex
 *
 * Top View Features:
 * - Deep sagittal interhemispheric fissure dividing Left and Right hemispheres down X = 0
 * - Anterior frontal poles at +Y and posterior occipital contours at -Y
 * - Specific, high-relief winding serpentine gyri and deep sulcal grooves
 * - Closed internal medial and transverse walls forming solid 3D anatomical volumes
 */

export function createBrainQuadrantGeometry(
  quadrant: 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right',
  resU = 72,
  resV = 72
): THREE.BufferGeometry {
  const isLeft = quadrant.includes('left');
  const isUpper = quadrant.includes('upper');
  const signX = isLeft ? -1 : 1;
  const signY = isUpper ? 1 : -1;

  const positions: number[] = [];
  const indices: number[] = [];
  const cortexGrid: number[][] = [];

  // 1. Build the Superior Cortex Surface (Front-facing dome in top view)
  for (let iv = 0; iv <= resV; iv++) {
    const v = iv / resV; // 0 (equator/transverse plane) to 1 (longitudinal pole)
    const phi = v * (Math.PI * 0.48);
    cortexGrid[iv] = [];

    for (let iu = 0; iu <= resU; iu++) {
      const u = iu / resU; // 0 (medial fissure plane) to 1 (lateral contour)
      const theta = u * (Math.PI * 0.50);

      // Base anatomical cranial ellipsoid
      let x = Math.sin(theta) * Math.cos(phi) * 1.28 * signX;
      let y = Math.sin(phi) * 1.58 * signY;
      let z = Math.cos(theta) * Math.cos(phi) * 1.08;

      // Frontal pole tapering (anterior, Y > 0.4)
      if (isUpper && y > 0.35) {
        const factor = 1.0 - (y - 0.35) * 0.24;
        x *= Math.max(0.66, factor);
      }
      // Occipital pole tapering (posterior, Y < -0.3)
      if (!isUpper && y < -0.28) {
        const factor = 1.0 - (-y - 0.28) * 0.20;
        x *= Math.max(0.70, factor);
      }

      // Medial Interhemispheric Fissure cleft (deep vertical groove at X = 0)
      const distFromFissure = Math.abs(x);
      if (distFromFissure < 0.26) {
        const tuck = (0.26 - distFromFissure) * 0.26;
        x = isLeft ? -(Math.abs(x) + tuck) : (Math.abs(x) + tuck);
        z -= (0.26 - distFromFissure) * 0.40;
      }

      // Specific Serpentine Gyral Convolutions (infinitely smooth domain-warped trigonometric field)
      const wx = Math.sin(y * 3.4 + 1.2) * 0.46 + Math.cos(x * 3.0) * 0.36;
      const wy = Math.cos(x * 3.4 + 0.5) * 0.46 + Math.sin(y * 3.0) * 0.36;
      const qx = x * 3.6 + wx;
      const qy = y * 3.6 + wy;

      const g1 = Math.sin(qx * 1.5 + Math.cos(qy * 1.7) * 1.35);
      const g2 = Math.cos(qy * 1.5 + Math.sin(qx * 1.6) * 1.35);
      const rawFolds = (g1 + g2) * 0.5;

      // Rounded gyri crests with sharp sulci valleys
      const sulcusProfile = Math.sign(rawFolds) * Math.pow(Math.abs(rawFolds), 0.72);
      const micro = (Math.sin(qx * 3.2) * Math.cos(qy * 3.2)) * 0.22;

      let fold = (sulcusProfile * 0.78 + micro) * 0.20;

      // Smooth taper near cut seams (medial & transverse plane) for clean assembly
      let boundaryFade = 1.0;
      if (u < 0.12) boundaryFade = Math.min(boundaryFade, u / 0.12);
      if (v < 0.12) boundaryFade = Math.min(boundaryFade, v / 0.12);
      fold *= boundaryFade;

      z += fold;
      z = Math.max(0.04, z);

      const idx = positions.length / 3;
      positions.push(x, y, z);
      cortexGrid[iv][iu] = idx;
    }
  }

  // Superior Cortex Surface Triangles
  for (let iv = 0; iv < resV; iv++) {
    for (let iu = 0; iu < resU; iu++) {
      const a = cortexGrid[iv][iu];
      const b = cortexGrid[iv + 1][iu];
      const c = cortexGrid[iv + 1][iu + 1];
      const d = cortexGrid[iv][iu + 1];

      if (isLeft) {
        indices.push(a, b, d);
        indices.push(b, c, d);
      } else {
        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }
  }

  // 2. Medial Sagittal Wall (iu = 0 along iv): connects cortex down to base at Z = 0
  const medialBaseIndices: number[] = [];
  for (let iv = 0; iv <= resV; iv++) {
    const cortexIdx = cortexGrid[iv][0];
    const x = positions[cortexIdx * 3];
    const y = positions[cortexIdx * 3 + 1];
    const baseIdx = positions.length / 3;
    positions.push(x, y, 0.0);
    medialBaseIndices[iv] = baseIdx;
  }
  for (let iv = 0; iv < resV; iv++) {
    const topA = cortexGrid[iv][0];
    const topB = cortexGrid[iv + 1][0];
    const botA = medialBaseIndices[iv];
    const botB = medialBaseIndices[iv + 1];
    if (isLeft) {
      indices.push(topA, botA, topB);
      indices.push(topB, botA, botB);
    } else {
      indices.push(topA, topB, botA);
      indices.push(topB, botB, botA);
    }
  }

  // 3. Transverse Wall (iv = 0 along iu): connects cortex down to base at Z = 0
  const transverseBaseIndices: number[] = [];
  for (let iu = 0; iu <= resU; iu++) {
    const cortexIdx = cortexGrid[0][iu];
    const x = positions[cortexIdx * 3];
    const y = positions[cortexIdx * 3 + 1];
    const baseIdx = positions.length / 3;
    positions.push(x, y, 0.0);
    transverseBaseIndices[iu] = baseIdx;
  }
  for (let iu = 0; iu < resU; iu++) {
    const topA = cortexGrid[0][iu];
    const topB = cortexGrid[0][iu + 1];
    const botA = transverseBaseIndices[iu];
    const botB = transverseBaseIndices[iu + 1];
    if (isLeft) {
      indices.push(topA, topB, botA);
      indices.push(topB, botB, botA);
    } else {
      indices.push(topA, botA, topB);
      indices.push(topB, botA, botB);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Generates an internal synaptic neural network / wireframe graph
 * that glows from inside each quadrant when separated!
 */
export function createSynapticCoreGeometry(
  quadrant: 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right'
): THREE.BufferGeometry {
  const isLeft = quadrant.includes('left');
  const isUpper = quadrant.includes('upper');

  const pointCount = 90;
  const lineCount = 140;
  const points: THREE.Vector3[] = [];

  const xCenter = isLeft ? -0.45 : 0.45;
  const yCenter = isUpper ? 0.45 : -0.45;
  const zCenter = 0.25;

  for (let i = 0; i < pointCount; i++) {
    const rx = (Math.random() - 0.5) * 0.7;
    const ry = (Math.random() - 0.5) * 0.9;
    const rz = (Math.random() - 0.5) * 0.4;
    points.push(new THREE.Vector3(xCenter + rx, yCenter + ry, zCenter + rz));
  }

  const positions: number[] = [];
  for (let i = 0; i < lineCount; i++) {
    const idxA = Math.floor(Math.random() * pointCount);
    let idxB = Math.floor(Math.random() * pointCount);
    while (idxB === idxA) idxB = Math.floor(Math.random() * pointCount);

    const dist = points[idxA].distanceTo(points[idxB]);
    if (dist < 0.6) {
      positions.push(
        points[idxA].x, points[idxA].y, points[idxA].z,
        points[idxB].x, points[idxB].y, points[idxB].z
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}
