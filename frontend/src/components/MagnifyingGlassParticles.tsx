import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface MagnifyingGlassParticlesProps {
  scrollProgress: number; // 0 to 1
  mousePos: { x: number; y: number }; // -1 to 1
}

const TOTAL_POINTS = 52000;

// Custom Vertex Shader for 3D Dot-Matrix Magnifying Glass
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
    // Non-linear staggered dispersal per particle
    float stagger = aRandom * 0.30;
    float progress = clamp((uScrollProgress - stagger) / (1.0 - stagger + 0.0001), 0.0, 1.0);
    // Smooth quintic easing for fluid organic burst
    float ease = progress * progress * (3.0 - 2.0 * progress);

    // Dynamic interpolation between assembled magnifying glass and dispersed constellation
    vec3 pos = mix(position, aDispPos, ease);

    // Subtle natural organic breathing & levitation wave
    float idleWave = sin(uTime * 1.6 + aRandom * 6.28) * 0.025 * (1.0 - ease * 0.6);
    pos.y += idleWave;
    pos.x += cos(uTime * 1.3 + aRandom * 6.28) * 0.018 * (1.0 - ease * 0.6);

    // Interactive mouse repulsion in 3D:
    // When cursor is near the magnifying glass dots, they smoothly part and ripple
    vec2 mouseScreen = vec2(uMouse.x * 2.2 * uAspect, uMouse.y * 2.2);
    float distToMouse = distance(pos.xy, mouseScreen);
    float repulseRadius = 1.35;

    if (distToMouse < repulseRadius) {
      float repulseForce = (1.0 - distToMouse / repulseRadius);
      repulseForce = repulseForce * repulseForce;
      vec2 pushDir = normalize(pos.xy - mouseScreen + vec2(0.0001));
      pos.xy += pushDir * repulseForce * 0.45 * (1.0 - ease * 0.85);
      pos.z += repulseForce * 0.38 * (1.0 - ease * 0.85);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size based on depth and resolution
    float baseSize = aSize * (540.0 / -mvPosition.z) * uPixelRatio;
    gl_PointSize = clamp(baseSize, 1.5, 36.0);

    // Color & alpha luminescence
    vColor = aColor;
    vAlpha = mix(0.95, 0.55, ease);
    // Subtle twinkling highlight
    vHighlight = sin(uTime * 2.5 + aRandom * 12.56) * 0.18 + 0.85;
  }
`;

// Custom Fragment Shader for Glowing Circular Stippled Dots
const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;
  varying float vHighlight;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) discard;

    // Soft Gaussian-like circular glow with bright center
    float strength = 1.0 - smoothstep(0.0, 0.5, dist);
    strength = pow(strength, 1.45);

    vec3 coreColor = vec3(1.0, 1.0, 1.0);
    vec3 finalColor = mix(vColor, coreColor, strength * 0.55) * vHighlight;

    gl_FragColor = vec4(finalColor, strength * vAlpha);
  }
`;

export const MagnifyingGlassParticles: React.FC<MagnifyingGlassParticlesProps> = ({
  scrollProgress,
  mousePos,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rootGroupRef = useRef<THREE.Group>(null);

  const { size } = useThree();

  // Generate 52,000 dots forming the 3D Magnifying Glass
  const particleGeometry = useMemo(() => {
    const posArray = new Float32Array(TOTAL_POINTS * 3);
    const dispArray = new Float32Array(TOTAL_POINTS * 3);
    const colArray = new Float32Array(TOTAL_POINTS * 3);
    const randArray = new Float32Array(TOTAL_POINTS);
    const sizeArray = new Float32Array(TOTAL_POINTS);

    // Magnifying glass composition:
    // Circular Lens centered at (0.55, 0.35, 0.0)
    // Handle extending down-left to (-1.8, -1.2, 0.6)
    const lensCenter = new THREE.Vector3(0.55, 0.32, 0.0);
    const lensRadius = 1.30;
    const rimOuter = 1.56;
    const rimThickness = 0.38;

    // Lens plane orientation: tilted slightly for 3D perspective
    const lensNormal = new THREE.Vector3(0.22, 0.12, 1.0).normalize();
    const upVec = new THREE.Vector3(0, 1, 0);
    const rightVec = new THREE.Vector3().crossVectors(lensNormal, upVec).normalize();
    const topVec = new THREE.Vector3().crossVectors(rightVec, lensNormal).normalize();

    // 1. Lens Rim & Frame (48% of points: high density, crisp beveled edges)
    const rimCount = Math.floor(TOTAL_POINTS * 0.48);
    // 2. Glass Lens (22% of points: convex dish with ethereal glow)
    const lensCount = Math.floor(TOTAL_POINTS * 0.22);
    // 3. Ergonomic Handle & Collar (30% of points: contoured cylindrical grip)
    const handleCount = TOTAL_POINTS - rimCount - lensCount;

    let idx = 0;

    // Color definitions from reference image (media_1794862684414_50d3df8c.jpg)
    const colMagenta = new THREE.Color(0xf43f5e); // Hot Magenta/Rose
    const colPink = new THREE.Color(0xec4899);    // Vibrant Neon Pink
    const colViolet = new THREE.Color(0xa855f7);  // Neon Purple
    const colCyan = new THREE.Color(0x00f5ff);    // Luminous Aqua/Cyan
    const colAzure = new THREE.Color(0x0284c7);   // Electric Azure
    const colGlass = new THREE.Color(0x38bdf8);   // Ethereal Lens Blue

    // === GENERATE RIM POINTS ===
    for (let i = 0; i < rimCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      // High density on outer beveled lip
      const u = Math.pow(Math.random(), 0.6);
      const r = lensRadius + u * (rimOuter - lensRadius);
      const zOffset = (Math.random() - 0.5) * rimThickness;

      const p = lensCenter.clone()
        .addScaledVector(rightVec, Math.cos(theta) * r)
        .addScaledVector(topVec, Math.sin(theta) * r)
        .addScaledVector(lensNormal, zOffset);

      posArray[idx * 3] = p.x;
      posArray[idx * 3 + 1] = p.y;
      posArray[idx * 3 + 2] = p.z;

      // Dispersed position on scroll
      const dir = p.clone().normalize();
      const burstDist = 3.2 + Math.random() * 4.8;
      const spreadX = (Math.random() - 0.5) * 8.5;
      const spreadY = (Math.random() - 0.5) * 6.5;
      const spreadZ = (Math.random() - 0.5) * 5.5;

      dispArray[idx * 3] = p.x * 1.5 + dir.x * burstDist + spreadX * 0.45;
      dispArray[idx * 3 + 1] = p.y * 1.5 + dir.y * burstDist + spreadY * 0.45;
      dispArray[idx * 3 + 2] = p.z * 1.2 + dir.z * burstDist + spreadZ * 0.45;

      // Dual-tone color mapping:
      // Upper & right rim has striking Magenta/Pink crescent highlight
      // Lower & left rim has striking Cyan/Aqua crescent highlight
      const angleRatio = (Math.sin(theta - Math.PI * 0.15) + 1.0) * 0.5; // 0 to 1
      const finalColor = new THREE.Color();
      if (angleRatio > 0.5) {
        const t = (angleRatio - 0.5) / 0.5;
        finalColor.lerpColors(colViolet, colMagenta, t);
        if (Math.abs(p.y - 1.2) < 0.4) finalColor.lerp(colPink, 0.5);
      } else {
        const t = angleRatio / 0.5;
        finalColor.lerpColors(colCyan, colAzure, t);
      }

      colArray[idx * 3] = finalColor.r;
      colArray[idx * 3 + 1] = finalColor.g;
      colArray[idx * 3 + 2] = finalColor.b;

      randArray[idx] = Math.random();
      sizeArray[idx] = 0.032 + Math.random() * 0.024;
      idx++;
    }

    // === GENERATE GLASS LENS POINTS ===
    for (let i = 0; i < lensCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (lensRadius * 0.97);
      // Double-convex glass dome
      const dome = (1 - (r / lensRadius) * (r / lensRadius)) * 0.16;
      const side = Math.random() > 0.5 ? 1 : -1;

      const p = lensCenter.clone()
        .addScaledVector(rightVec, Math.cos(theta) * r)
        .addScaledVector(topVec, Math.sin(theta) * r)
        .addScaledVector(lensNormal, dome * side);

      posArray[idx * 3] = p.x;
      posArray[idx * 3 + 1] = p.y;
      posArray[idx * 3 + 2] = p.z;

      // Dispersed position
      const dir = p.clone().normalize();
      const burstDist = 3.6 + Math.random() * 5.2;
      const spreadX = (Math.random() - 0.5) * 8.0;
      const spreadY = (Math.random() - 0.5) * 6.5;
      const spreadZ = (Math.random() - 0.5) * 5.0;

      dispArray[idx * 3] = p.x * 1.6 + dir.x * burstDist + spreadX * 0.4;
      dispArray[idx * 3 + 1] = p.y * 1.6 + dir.y * burstDist + spreadY * 0.4;
      dispArray[idx * 3 + 2] = p.z * 1.2 + dir.z * burstDist + spreadZ * 0.4;

      // Glass lens reflections: subtle specular reflection arcs in cyan and magenta
      const edgeHighlight = Math.pow(r / lensRadius, 2.5);
      const angleRatio = (Math.sin(theta - Math.PI * 0.15) + 1.0) * 0.5;
      const finalColor = new THREE.Color(colGlass);
      if (angleRatio > 0.6) {
        finalColor.lerp(colPink, edgeHighlight * 0.85);
      } else if (angleRatio < 0.4) {
        finalColor.lerp(colCyan, edgeHighlight * 0.85);
      }

      colArray[idx * 3] = finalColor.r;
      colArray[idx * 3 + 1] = finalColor.g;
      colArray[idx * 3 + 2] = finalColor.b;

      randArray[idx] = Math.random();
      sizeArray[idx] = 0.022 + Math.random() * 0.018;
      idx++;
    }

    // === GENERATE HANDLE & COLLAR POINTS ===
    const handleStart = lensCenter.clone()
      .addScaledVector(rightVec, -lensRadius * 0.95)
      .addScaledVector(topVec, -lensRadius * 0.35);
    const handleDir = new THREE.Vector3(-1.35, -0.85, 0.65).normalize();
    const handleLen = 2.55;

    const handleNorm1 = new THREE.Vector3().crossVectors(handleDir, new THREE.Vector3(0, 1, 0)).normalize();
    const handleNorm2 = new THREE.Vector3().crossVectors(handleDir, handleNorm1).normalize();

    for (let i = 0; i < handleCount; i++) {
      const t = Math.random(); // 0 (collar) to 1 (pommel)
      const dist = t * handleLen;

      // Ergonomic contoured handle radius profile
      let radius = 0.15;
      if (t < 0.14) {
        // Connector collar with decorative ridges
        radius = 0.13 + (t / 0.14) * 0.05;
        if (Math.abs(t - 0.07) < 0.02) radius += 0.035; // decorative collar ring
      } else if (t < 0.72) {
        // Ergonomic palm swell
        const midT = (t - 0.14) / 0.58;
        radius = 0.18 + Math.sin(midT * Math.PI) * 0.085;
      } else {
        // Taper towards pommel cap
        const endT = (t - 0.72) / 0.28;
        radius = 0.21 - Math.sin(endT * Math.PI * 0.5) * 0.04;
        if (t > 0.94) radius += 0.045; // rounded pommel end
      }

      const angle = Math.random() * Math.PI * 2;
      const p = handleStart.clone()
        .addScaledVector(handleDir, dist)
        .addScaledVector(handleNorm1, Math.cos(angle) * radius)
        .addScaledVector(handleNorm2, Math.sin(angle) * radius);

      posArray[idx * 3] = p.x;
      posArray[idx * 3 + 1] = p.y;
      posArray[idx * 3 + 2] = p.z;

      // Dispersed position
      const dir = p.clone().normalize();
      const burstDist = 3.5 + Math.random() * 5.0;
      const spreadX = (Math.random() - 0.5) * 8.5;
      const spreadY = (Math.random() - 0.5) * 6.5;
      const spreadZ = (Math.random() - 0.5) * 5.5;

      dispArray[idx * 3] = p.x * 1.5 + dir.x * burstDist + spreadX * 0.45;
      dispArray[idx * 3 + 1] = p.y * 1.5 + dir.y * burstDist + spreadY * 0.45;
      dispArray[idx * 3 + 2] = p.z * 1.2 + dir.z * burstDist + spreadZ * 0.45;

      // Dual-tone sheen on handle:
      // Upper crest of handle is Neon Magenta / Pink
      // Lower crest of handle is Electric Cyan / Aqua
      const crest = Math.sin(angle); // -1 (bottom) to +1 (top)
      const crestRatio = (crest + 1.0) * 0.5;

      const finalColor = new THREE.Color();
      finalColor.lerpColors(colCyan, colMagenta, crestRatio);
      if (t < 0.14) finalColor.lerp(colViolet, 0.4); // Collar accent

      colArray[idx * 3] = finalColor.r;
      colArray[idx * 3 + 1] = finalColor.g;
      colArray[idx * 3 + 2] = finalColor.b;

      randArray[idx] = Math.random();
      sizeArray[idx] = 0.028 + Math.random() * 0.022;
      idx++;
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

    // 3. Update root tilt & idle levitation
    const floatOffsetY = Math.sin(time * 1.2) * 0.04;
    const floatRoll = Math.cos(time * 0.8) * 0.012;

    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.x = currentRotation.current.x;
      rootGroupRef.current.rotation.y = currentRotation.current.y;
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
    <group ref={rootGroupRef} position={[-0.1, 0, 0]}>
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
