import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface LayerStackParticlesProps {
  scrollProgress: number; // 0 to 1
  mousePos: { x: number; y: number }; // -1 to 1
}

const TOTAL_LAYERS = 5;
const POINTS_PER_LAYER = 10000;
const TOTAL_POINTS = TOTAL_LAYERS * POINTS_PER_LAYER; // 50,000 dots

// Custom Vertex Shader for 3D Isometric Dot Stack Dispersal & Mouse Ripple
const vertexShader = `
  uniform float uScrollProgress;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uTime;
  uniform float uPixelRatio;

  attribute vec3 aDispPos;
  attribute vec3 aColor;
  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vHighlight;

  void main() {
    // Staggered non-linear dispersal per layer & particle
    float stagger = aRandom * 0.28;
    float progress = clamp((uScrollProgress - stagger) / (1.0 - stagger + 0.0001), 0.0, 1.0);
    // Smooth quintic easing for fluid organic layer explosion
    float ease = progress * progress * (3.0 - 2.0 * progress);

    // Dynamic interpolation between assembled stack and exploded layers
    vec3 pos = mix(position, aDispPos, ease);

    // Subtle natural breathing wave
    float idleWave = sin(uTime * 1.6 + aRandom * 6.28) * 0.025 * (1.0 - ease * 0.5);
    pos.y += idleWave;

    // Interactive mouse repulsion in 3D:
    // When cursor is near the isometric stack, dots part and ripple organically
    vec2 mouseScreen = vec2(uMouse.x * 2.2 * uAspect, uMouse.y * 2.2);
    float distToMouse = distance(pos.xz, mouseScreen);
    float repulseRadius = 1.35;

    if (distToMouse < repulseRadius) {
      float repulseForce = (1.0 - distToMouse / repulseRadius);
      repulseForce = repulseForce * repulseForce;
      vec2 pushDir = normalize(pos.xz - mouseScreen + vec2(0.0001));
      pos.xz += pushDir * repulseForce * 0.45 * (1.0 - ease * 0.8);
      pos.y += repulseForce * 0.35 * (1.0 - ease * 0.8);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation based on distance
    float baseSize = aSize * (540.0 / -mvPosition.z) * uPixelRatio;
    gl_PointSize = clamp(baseSize, 1.5, 36.0);

    // Pass color & luminescence
    vColor = aColor;
    vAlpha = mix(0.95, 0.65, ease);
    // Subtle twinkling highlight
    vHighlight = sin(uTime * 2.4 + aRandom * 12.56) * 0.18 + 0.85;
  }
`;

// Custom Fragment Shader for Glowing Circular Dots
const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;
  varying float vHighlight;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) discard;

    // Soft Gaussian-like circular glow with brilliant center
    float strength = 1.0 - smoothstep(0.0, 0.5, dist);
    strength = pow(strength, 1.4);

    vec3 coreColor = vec3(1.0, 1.0, 1.0);
    vec3 finalColor = mix(vColor, coreColor, strength * 0.5) * vHighlight;

    gl_FragColor = vec4(finalColor, strength * vAlpha);
  }
`;

// Ray march function for rounded squircle boundary
function getSquircleBoundary(theta: number, w = 2.45, l = 2.45, r = 0.58) {
  const hw = w / 2 - r;
  const hl = l / 2 - r;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  let t = 0;
  for (let step = 0; step < 40; step++) {
    const px = t * cosT;
    const pz = t * sinT;
    const dx = Math.max(0, Math.abs(px) - hw);
    const dz = Math.max(0, Math.abs(pz) - hl);
    const dist = Math.sqrt(dx * dx + dz * dz) - r;
    t -= dist;
    if (Math.abs(dist) < 0.001) break;
  }
  return { x: t * cosT, z: t * sinT };
}

export const LayerStackParticles: React.FC<LayerStackParticlesProps> = ({
  scrollProgress,
  mousePos,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rootGroupRef = useRef<THREE.Group>(null);

  const { size } = useThree();

  // Generate 50,000 dots forming the 5 stacked rounded squircle plates
  const particleGeometry = useMemo(() => {
    const posArray = new Float32Array(TOTAL_POINTS * 3);
    const dispArray = new Float32Array(TOTAL_POINTS * 3);
    const colArray = new Float32Array(TOTAL_POINTS * 3);
    const randArray = new Float32Array(TOTAL_POINTS);
    const sizeArray = new Float32Array(TOTAL_POINTS);

    const baseSpacing = 0.24; // Tight vertical stack when assembled
    const explodedSpacing = 0.95; // Expanded vertical spacing when separated

    let pointIdx = 0;

    for (let layer = 0; layer < TOTAL_LAYERS; layer++) {
      // Y-offset in assembled state (-0.48 to +0.48)
      const assembledY = (layer - (TOTAL_LAYERS - 1) / 2) * baseSpacing;
      // Target Y-offset in exploded state (-1.9 to +1.9)
      const explodedY = (layer - (TOTAL_LAYERS - 1) / 2) * explodedSpacing;

      // Color theme per layer (top layers have brighter cyan highlights, bottom have deeper indigo/violet)
      const layerRatio = layer / (TOTAL_LAYERS - 1); // 0 (bottom) to 1 (top)

      for (let p = 0; p < POINTS_PER_LAYER; p++) {
        const rand = Math.random();
        const theta = Math.random() * Math.PI * 2;
        const b = getSquircleBoundary(theta);

        let px: number;
        let pz: number;
        let py = assembledY;
        let isRim = false;

        // 55% of points trace the raised, beveled outer rim (high density)
        if (p < POINTS_PER_LAYER * 0.55) {
          isRim = true;
          // Subtly distributed around the rim perimeter
          const rimDist = 0.90 + Math.random() * 0.10;
          px = b.x * rimDist;
          pz = b.z * rimDist;
          // Beveled rim has vertical thickness
          const bevelHeight = (Math.random() - 0.5) * 0.08;
          py += bevelHeight;
        } else {
          // 45% of points fill the inner recessed plate basin
          const innerDist = Math.sqrt(Math.random()) * 0.88;
          px = b.x * innerDist;
          pz = b.z * innerDist;
          // Slightly lower recessed floor
          py -= 0.025;
        }

        // Assembled position
        posArray[pointIdx * 3] = px;
        posArray[pointIdx * 3 + 1] = py;
        posArray[pointIdx * 3 + 2] = pz;

        // Exploded position on scroll:
        // Layers expand vertically, plus subtle radial breathing and constellation scatter
        const len = Math.sqrt(px * px + pz * pz) || 1.0;
        const dirX = px / len;
        const dirZ = pz / len;

        const burstDist = 0.8 + Math.random() * 1.8;
        const scatterX = (Math.random() - 0.5) * 1.6;
        const scatterZ = (Math.random() - 0.5) * 1.6;

        dispArray[pointIdx * 3] = px * 1.35 + dirX * burstDist + scatterX;
        dispArray[pointIdx * 3 + 1] = explodedY + (Math.random() - 0.5) * 0.45;
        dispArray[pointIdx * 3 + 2] = pz * 1.35 + dirZ * burstDist + scatterZ;

        // Iridescent Color computation matching reference image:
        // Radiant Cyan/Aqua -> Electric Azure -> Neon Violet/Purple
        const diagonal = (px + pz) / 3.2; // -1 to 1 along corner diagonal
        const cornerGlow = THREE.MathUtils.smoothstep(diagonal, -0.8, 0.8);

        // Palette definitions
        const colCyan = new THREE.Color(0x00f5ff);    // Luminous Aqua/Cyan
        const colAzure = new THREE.Color(0x38bdf8);   // Electric Sky Blue
        const colViolet = new THREE.Color(0xa855f7);  // Neon Purple
        const colIndigo = new THREE.Color(0x6366f1);  // Royal Indigo

        let finalColor = new THREE.Color();

        if (isRim) {
          // Rims have vivid violet corners and electric cyan glints
          finalColor.lerpColors(colViolet, colCyan, cornerGlow);
          if (layer === TOTAL_LAYERS - 1) {
            finalColor.lerp(new THREE.Color(0xffffff), 0.35); // Top rim extra brilliant
          }
        } else {
          // Inner basin has radiant cyan pool in the corner and azure/indigo depth
          finalColor.lerpColors(colIndigo, colAzure, cornerGlow);
          if (cornerGlow > 0.6) {
            finalColor.lerp(colCyan, (cornerGlow - 0.6) / 0.4);
          }
        }

        colArray[pointIdx * 3] = finalColor.r;
        colArray[pointIdx * 3 + 1] = finalColor.g;
        colArray[pointIdx * 3 + 2] = finalColor.b;

        randArray[pointIdx] = Math.random();
        // Dot size: rims have slightly larger, more prominent dots
        sizeArray[pointIdx] = isRim
          ? 0.034 + Math.random() * 0.026
          : 0.024 + Math.random() * 0.020;

        pointIdx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('aDispPos', new THREE.BufferAttribute(dispArray, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colArray, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randArray, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizeArray, 1));

    return geometry;
  }, []);

  // Shader Uniforms
  const uniforms = useMemo(() => {
    return {
      uScrollProgress: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: size.width / Math.max(1, size.height) },
      uTime: { value: 0.0 },
      uPixelRatio: { value: Math.min(2.0, window.devicePixelRatio || 1.0) },
    };
  }, [size]);

  // Smooth mouse tilt & scroll damping
  const currentRotation = useRef({ x: 0, y: 0 });
  const currentScrollProgress = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Mouse Interaction: 3D tilt follows cursor smoothly
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

    // 2. Smoothly damped scroll progress for seamless forward and reverse scrub
    currentScrollProgress.current = THREE.MathUtils.damp(
      currentScrollProgress.current,
      scrollProgress,
      6.0,
      delta
    );

    // 3. Update root isometric tilt & idle levitation
    const floatOffsetY = Math.sin(time * 1.2) * 0.05;
    const floatRoll = Math.cos(time * 0.8) * 0.015;

    if (rootGroupRef.current) {
      // Classic 3D Isometric View (~35 deg pitch tilt on X, -45 deg yaw on Y)
      rootGroupRef.current.rotation.x = 0.61 + currentRotation.current.x;
      rootGroupRef.current.rotation.y = -Math.PI / 4 + currentRotation.current.y;
      rootGroupRef.current.rotation.z = floatRoll;
      rootGroupRef.current.position.y = floatOffsetY;
    }

    // 4. Update Shader uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.uScrollProgress.value = currentScrollProgress.current;
      materialRef.current.uniforms.uMouse.value.set(mousePos.x, mousePos.y);
      materialRef.current.uniforms.uAspect.value = size.width / Math.max(1, size.height);
      materialRef.current.uniforms.uTime.value = time;
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      <points ref={pointsRef} geometry={particleGeometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
