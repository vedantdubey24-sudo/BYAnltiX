import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

interface BrainModelProps {
  scrollProgress: number; // 0 to 1
  mousePos: { x: number; y: number }; // -1 to 1
}

type QuadrantKey = 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right';

interface QuadrantConfig {
  id: QuadrantKey;
  dir: [number, number, number]; // x, y, z translation multipliers in screen space
  rot: [number, number, number]; // x, y, z rotation multipliers in screen space
}

// 4 Exploded Anatomical Quadrants from Top View
const QUADRANTS: QuadrantConfig[] = [
  {
    id: 'upper-left',
    dir: [-1.65, 1.35, 0.2],
    rot: [0.08, -0.16, -0.12],
  },
  {
    id: 'upper-right',
    dir: [1.65, 1.35, 0.2],
    rot: [0.08, 0.16, 0.12],
  },
  {
    id: 'lower-left',
    dir: [-1.65, -1.35, -0.15],
    rot: [-0.08, -0.16, -0.08],
  },
  {
    id: 'lower-right',
    dir: [1.65, -1.35, -0.15],
    rot: [-0.08, 0.16, 0.08],
  },
];

export const BrainModel: React.FC<BrainModelProps> = ({
  scrollProgress,
  mousePos,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const upperLeftRef = useRef<THREE.Group>(null);
  const upperRightRef = useRef<THREE.Group>(null);
  const lowerLeftRef = useRef<THREE.Group>(null);
  const lowerRightRef = useRef<THREE.Group>(null);

  // Load the authentic 3D anatomical human brain asset
  const { scene } = useGLTF('/models/brain.glb');

  // Highly Specular Silver-Metallic Anatomical Brain Material
  const brainMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xdce2ec), // High-clarity silver-white
      metalness: 0.64, // Liquid metallic silver sheen
      roughness: 0.20, // Crisp specular reflection along gyri crests
      clearcoat: 0.95, // Crystal clear specular coat
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
      emissive: new THREE.Color(0x0c0e12),
      emissiveIntensity: 0.15,
      flatShading: false,
      side: THREE.DoubleSide,
    });

    // Custom shader injection for crisp silver-white Fresnel edge glow
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uFresnelColor = { value: new THREE.Color(0xffffff) };
      shader.uniforms.uFresnelBias = { value: 0.1 };
      shader.uniforms.uFresnelScale = { value: 1.4 };
      shader.uniforms.uFresnelPower = { value: 2.8 };

      shader.vertexShader = `
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        ${shader.vertexShader}
      `.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vViewDirection = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
        `
      );

      shader.fragmentShader = `
        uniform vec3 uFresnelColor;
        uniform float uFresnelBias;
        uniform float uFresnelScale;
        uniform float uFresnelPower;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        ${shader.fragmentShader}
      `.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        float fresnelFactor = uFresnelBias + uFresnelScale * pow(1.0 - clamp(dot(vViewDirection, vWorldNormal), 0.0, 1.0), uFresnelPower);
        gl_FragColor.rgb += uFresnelColor * clamp(fresnelFactor * 0.45, 0.0, 1.0);
        `
      );
    };

    return mat;
  }, []);

  // Internal glowing synaptic lines when separated
  const synapticLineMat = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Organize the 65 anatomical meshes into the 4 functional quadrants
  // At scrollProgress = 0, they fit together with 100% continuous anatomical unity (one single brain model)
  const quadrantMeshes = useMemo(() => {
    const groups: Record<QuadrantKey, THREE.Mesh[]> = {
      'upper-left': [],
      'upper-right': [],
      'lower-left': [],
      'lower-right': [],
    };

    // Center offset and normalization scale calculated from model bounds
    const midX = -0.725;
    const midY = -79.7;
    const midZ = 1547.56;
    const scale = 0.0182;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const origMesh = child as THREE.Mesh;
        const mesh = origMesh.clone();
        mesh.geometry = origMesh.geometry.clone();

        // Translate geometry to local origin and scale
        mesh.geometry.translate(-midX, -midY, -midZ);
        mesh.geometry.scale(scale, scale, scale);
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeVertexNormals();

        // Calculate center for quadrant categorization
        const center = new THREE.Vector3();
        mesh.geometry.boundingBox?.getCenter(center);

        // In model coordinates:
        // Left is X > 0, Right is X < 0
        // Frontal (anterior) is Y < 0, Occipital/Parietal (posterior) is Y >= 0
        const isLeft = mesh.name.toLowerCase().includes('left') || center.x > 0;
        const isFrontal = center.y < 0;

        const q: QuadrantKey = (isFrontal ? 'upper-' : 'lower-') +
          (isLeft ? 'left' : 'right') as QuadrantKey;

        mesh.material = brainMaterial;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        groups[q].push(mesh);
      }
    });

    return groups;
  }, [scene, brainMaterial]);

  // Smooth interpolated values for mouse & scroll
  const currentRotation = useRef({ x: 0, y: 0 });
  const currentSeparation = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Mouse Interaction: smooth damping towards mouse position
    const targetRotY = mousePos.x * 0.28;
    const targetRotX = -mousePos.y * 0.22;

    currentRotation.current.x = THREE.MathUtils.damp(
      currentRotation.current.x,
      targetRotX,
      4.0,
      delta
    );
    currentRotation.current.y = THREE.MathUtils.damp(
      currentRotation.current.y,
      targetRotY,
      4.0,
      delta
    );

    // 2. Idle floating movement (subtle natural levitation)
    const floatOffsetY = Math.sin(time * 1.2) * 0.04;
    const floatRoll = Math.cos(time * 0.8) * 0.012;

    if (rootGroupRef.current) {
      // Base orientation:
      // Tilted ~15 degrees (0.26 rad) towards camera so superior surface + cranial depth are both visible
      rootGroupRef.current.rotation.x = 0.26 + currentRotation.current.x;
      rootGroupRef.current.rotation.y = currentRotation.current.y;
      rootGroupRef.current.rotation.z = Math.PI + floatRoll; // Rotates model so frontal lobes point up and superior points at camera
      rootGroupRef.current.position.y = floatOffsetY;
    }

    // 3. Separation logic strictly driven by scrollProgress:
    // At scrollProgress <= 0.10: completely assembled into ONE unified single brain (separation = 0)
    // As scrollProgress increases from 0.10 to 0.85: cleanly separates into 4 quadrants
    let targetSep = 0;
    if (scrollProgress <= 0.10) {
      targetSep = 0;
    } else {
      const t = Math.min(1, Math.max(0, (scrollProgress - 0.10) / 0.72));
      targetSep = t * t * (3 - 2 * t);
    }

    currentSeparation.current = THREE.MathUtils.damp(
      currentSeparation.current,
      targetSep,
      5.5,
      delta
    );

    const s = currentSeparation.current;

    // Apply smooth separation translation & rotation to the 4 quadrants
    const refs = {
      'upper-left': upperLeftRef.current,
      'upper-right': upperRightRef.current,
      'lower-left': lowerLeftRef.current,
      'lower-right': lowerRightRef.current,
    };

    QUADRANTS.forEach((q) => {
      const group = refs[q.id];
      if (group) {
        // Position separation in screen space
        group.position.x = q.dir[0] * s;
        group.position.y = q.dir[1] * s;
        group.position.z = q.dir[2] * s;

        // Subtle rotation during separation
        group.rotation.x = q.rot[0] * s;
        group.rotation.y = q.rot[1] * s;
        group.rotation.z = q.rot[2] * s;
      }
    });

    synapticLineMat.opacity = Math.min(0.8, s * 0.9);
  });

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      {/* Upper-Left Section (Left Frontal Cortex) */}
      <group ref={upperLeftRef}>
        {quadrantMeshes['upper-left'].map((mesh, i) => (
          <primitive key={`ul-${i}`} object={mesh} />
        ))}
      </group>

      {/* Upper-Right Section (Right Frontal Cortex) */}
      <group ref={upperRightRef}>
        {quadrantMeshes['upper-right'].map((mesh, i) => (
          <primitive key={`ur-${i}`} object={mesh} />
        ))}
      </group>

      {/* Lower-Left Section (Left Parieto-Occipital & Cerebellum) */}
      <group ref={lowerLeftRef}>
        {quadrantMeshes['lower-left'].map((mesh, i) => (
          <primitive key={`ll-${i}`} object={mesh} />
        ))}
      </group>

      {/* Lower-Right Section (Right Parieto-Occipital & Cerebellum) */}
      <group ref={lowerRightRef}>
        {quadrantMeshes['lower-right'].map((mesh, i) => (
          <primitive key={`lr-${i}`} object={mesh} />
        ))}
      </group>

      {/* Ethereal Synaptic Energy Core visible during separation */}
      <mesh scale={0.45 * Math.min(1, currentSeparation.current * 1.5)}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0.18 * currentSeparation.current}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

useGLTF.preload('/models/brain.glb');
