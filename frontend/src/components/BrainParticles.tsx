import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

interface BrainParticlesProps {
  scrollProgress: number; // 0 to 1
  mousePos: { x: number; y: number }; // -1 to 1
}

// Custom Vertex Shader for Particle Dispersion & Mouse Interaction
const vertexShader = `
  uniform float uScrollProgress;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uTime;
  uniform float uPixelRatio;

  attribute vec3 aDispPos;
  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;
  varying float vHighlight;

  void main() {
    // Staggered non-linear dispersal per particle
    float stagger = aRandom * 0.32;
    float progress = clamp((uScrollProgress - stagger) / (1.0 - stagger + 0.0001), 0.0, 1.0);
    // Smooth quintic easing for fluid organic burst
    float ease = progress * progress * (3.0 - 2.0 * progress);

    // Dynamic interpolation between assembled brain and dispersed cloud
    vec3 pos = mix(position, aDispPos, ease);

    // Subtle natural organic breathing & hovering wave
    float idleWave = sin(uTime * 1.8 + aRandom * 6.28) * 0.035 * (1.0 - ease * 0.6);
    pos.y += idleWave;
    pos.x += cos(uTime * 1.4 + aRandom * 6.28) * 0.025 * (1.0 - ease * 0.6);

    // Interactive mouse repulsion in 3D:
    // When cursor is near particles, they smoothly part/ripple
    vec2 mouseScreen = vec2(uMouse.x * 2.1 * uAspect, uMouse.y * 2.1);
    float distToMouse = distance(pos.xy, mouseScreen);
    float repulseRadius = 1.35;

    if (distToMouse < repulseRadius) {
      float repulseForce = (1.0 - distToMouse / repulseRadius);
      // Smooth falloff
      repulseForce = repulseForce * repulseForce;
      vec2 pushDir = normalize(pos.xy - mouseScreen + vec2(0.0001));
      pos.xy += pushDir * repulseForce * 0.55 * (1.0 - ease * 0.85);
      pos.z += repulseForce * 0.45 * (1.0 - ease * 0.85);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size based on depth and screen resolution
    float baseSize = aSize * (520.0 / -mvPosition.z) * uPixelRatio;
    gl_PointSize = clamp(baseSize, 1.5, 36.0);

    // Opacity & luminescence calculation
    vAlpha = mix(0.92, 0.48, ease);
    // Subtle twinkling highlight
    vHighlight = sin(uTime * 2.5 + aRandom * 12.56) * 0.2 + 0.8;
  }
`;

// Custom Fragment Shader for Glowing Circular Stippled Dots
const fragmentShader = `
  varying float vAlpha;
  varying float vHighlight;

  void main() {
    // Coordinate within point sprite (-0.5 to 0.5)
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) discard;

    // Soft Gaussian-like circular glow with bright core
    float strength = 1.0 - smoothstep(0.0, 0.5, dist);
    strength = pow(strength, 1.5);

    // Core is brilliant pure white, outer halo is sleek silver-blue
    vec3 coreColor = vec3(1.0, 1.0, 1.0);
    vec3 haloColor = vec3(0.82, 0.88, 0.98);
    vec3 color = mix(haloColor, coreColor, strength) * vHighlight;

    gl_FragColor = vec4(color, strength * vAlpha);
  }
`;

export const BrainParticles: React.FC<BrainParticlesProps> = ({
  scrollProgress,
  mousePos,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rootGroupRef = useRef<THREE.Group>(null);

  const { size } = useThree();

  // Load the authentic 3D brain model asset
  const { scene } = useGLTF('/models/brain.glb');

  // Extract all ~80,000 anatomical vertices into our custom particle system
  const particleGeometry = useMemo(() => {
    const positions: number[] = [];
    const midX = -0.725;
    const midY = -79.7;
    const midZ = 1547.56;
    const scale = 0.0182;

    // Base rotation so top superior cortex faces the camera and frontal lobes point up
    const rot = new THREE.Euler(0.24, 0, Math.PI);
    const v = new THREE.Vector3();

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const posAttr = (child as THREE.Mesh).geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          v.set(
            (posAttr.getX(i) - midX) * scale,
            (posAttr.getY(i) - midY) * scale,
            (posAttr.getZ(i) - midZ) * scale
          );
          v.applyEuler(rot);
          positions.push(v.x, v.y, v.z);
        }
      }
    });

    const count = positions.length / 3;
    const posArray = new Float32Array(positions);
    const dispArray = new Float32Array(count * 3);
    const randArray = new Float32Array(count);
    const sizeArray = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = posArray[i * 3];
      const y = posArray[i * 3 + 1];
      const z = posArray[i * 3 + 2];

      const len = Math.sqrt(x * x + y * y + z * z) || 1.0;
      const nx = x / len;
      const ny = y / len;
      const nz = z / len;

      // Dispersed constellation covering full 3D space on scroll
      const burstDist = 3.6 + Math.random() * 5.4;
      const spreadX = (Math.random() - 0.5) * 8.5;
      const spreadY = (Math.random() - 0.5) * 7.0;
      const spreadZ = (Math.random() - 0.5) * 6.0;

      dispArray[i * 3] = x * 1.8 + nx * burstDist + spreadX * 0.45;
      dispArray[i * 3 + 1] = y * 1.8 + ny * burstDist + spreadY * 0.45;
      dispArray[i * 3 + 2] = z * 1.2 + nz * burstDist + spreadZ * 0.45;

      randArray[i] = Math.random();
      // Particle dot size variation for rich organic stippling
      sizeArray[i] = 0.026 + Math.random() * 0.024;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('aDispPos', new THREE.BufferAttribute(dispArray, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randArray, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizeArray, 1));

    return geometry;
  }, [scene]);

  // Shader Material uniforms
  const uniforms = useMemo(() => {
    return {
      uScrollProgress: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: size.width / Math.max(1, size.height) },
      uTime: { value: 0.0 },
      uPixelRatio: { value: Math.min(2.0, window.devicePixelRatio || 1.0) },
    };
  }, [size]);

  // Smooth mouse tilt & scroll updates
  const currentRotation = useRef({ x: 0, y: 0 });
  const currentScrollProgress = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Mouse Interaction: 3D tilt follows cursor smoothly
    const targetRotY = mousePos.x * 0.32;
    const targetRotX = -mousePos.y * 0.24;

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
    const floatOffsetY = Math.sin(time * 1.2) * 0.05;
    const floatRoll = Math.cos(time * 0.8) * 0.015;

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

useGLTF.preload('/models/brain.glb');
