import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LayerStackModelProps {
  scrollProgress: number; // 0 to 1
  mousePos: { x: number; y: number }; // -1 to 1
}

// 5 Isometric Data Stack Layers
const TOTAL_LAYERS = 5;

export const LayerStackModel: React.FC<LayerStackModelProps> = ({
  scrollProgress,
  mousePos,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const layerRefs = useRef<(THREE.Group | null)[]>([]);

  // 1. Generate the Rounded Squircle Plate Geometry (Outer Beveled Rim)
  const plateGeometry = useMemo(() => {
    const w = 2.45;
    const h = 2.45;
    const r = 0.58; // Corner radius for squircle
    const x = -w / 2;
    const y = -h / 2;

    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.09,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 1,
      bevelSize: 0.075,
      bevelThickness: 0.075,
    });
    geo.center();
    // Rotate so plate lies in horizontal XZ plane
    geo.rotateX(Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 2. Inner Recessed Dish / Floor Geometry
  const innerDishGeometry = useMemo(() => {
    const w = 2.15;
    const h = 2.15;
    const r = 0.48;
    const x = -w / 2;
    const y = -h / 2;

    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const geo = new THREE.ShapeGeometry(shape, 32);
    geo.rotateX(-Math.PI / 2);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 3. Iridescent Chrome/Glass Material for the Outer Rim
  const rimMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0a121e), // Deep obsidian cyan-black base
      metalness: 0.65,
      roughness: 0.12, // High-gloss specular glass-metal
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95,
      emissive: new THREE.Color(0x061528),
      emissiveIntensity: 0.25,
      flatShading: false,
    });

    // Custom shader injection for iridescent Cyan/Teal -> Azure -> Violet rim sheen
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uCyanColor = { value: new THREE.Color(0x00f5ff) };
      shader.uniforms.uVioletColor = { value: new THREE.Color(0xa855f7) };
      shader.uniforms.uBlueColor = { value: new THREE.Color(0x2563eb) };

      shader.vertexShader = `
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        varying vec3 vWorldPos;
        ${shader.vertexShader}
      `.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vViewDirection = normalize(cameraPosition - vWorldPos);
        `
      );

      shader.fragmentShader = `
        uniform vec3 uCyanColor;
        uniform vec3 uVioletColor;
        uniform vec3 uBlueColor;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        varying vec3 vWorldPos;
        ${shader.fragmentShader}
      `.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        float fresnel = 1.0 - clamp(dot(vViewDirection, vWorldNormal), 0.0, 1.0);
        float fCyan = pow(fresnel, 2.2);
        float fViolet = pow(fresnel, 4.0);

        // Gradient along corner diagonals
        float diagonal = sin((vWorldPos.x + vWorldPos.z) * 1.5) * 0.5 + 0.5;
        vec3 iridColor = mix(uCyanColor, uVioletColor, diagonal);
        iridColor = mix(iridColor, uBlueColor, 1.0 - fresnel);

        gl_FragColor.rgb += iridColor * (fCyan * 0.75 + fViolet * 0.5);
        `
      );
    };

    return mat;
  }, []);

  // 4. Luminous Inner Dish Floor Material (with radiant Cyan-Blue gradient)
  const dishMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0c2238),
      metalness: 0.45,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.35,
    });

    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = `
        varying vec3 vLocalPos;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vLocalPos = position;
        `
      );

      shader.fragmentShader = `
        varying vec3 vLocalPos;
        ${shader.fragmentShader}
      `.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        // Radiant cyan pool in one corner/edge
        float cornerGlow = smoothstep(-1.2, 1.2, vLocalPos.x + vLocalPos.z);
        vec3 poolCyan = vec3(0.0, 0.92, 0.98);
        vec3 poolViolet = vec3(0.65, 0.35, 0.95);
        vec3 grad = mix(poolViolet * 0.3, poolCyan, cornerGlow);
        gl_FragColor.rgb += grad * 0.55;
        `
      );
    };

    return mat;
  }, []);

  // 5. Floating Data Particles between separated layers
  const particlesGeo = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const particlesMat = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(0x38bdf8),
      size: 0.035,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Base stacked Y-offsets when assembled: 5 layers tightly stacked
  const baseSpacing = 0.24;
  const assembledY = useMemo(() => {
    return [-2, -1, 0, 1, 2].map((idx) => idx * baseSpacing);
  }, []);

  // Dispersed Y-offsets when exploded on scroll
  const dispersedY = useMemo(() => {
    return [-1.8, -0.9, 0.0, 0.9, 1.8];
  }, []);

  // Mouse & Scroll interpolation
  const currentRotation = useRef({ x: 0, y: 0 });
  const currentSeparation = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Mouse Interaction: subtle parallax tilt around isometric axis
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

    // 2. Idle floating levitation
    const floatOffsetY = Math.sin(time * 1.2) * 0.06;
    const floatRoll = Math.cos(time * 0.8) * 0.015;

    if (rootGroupRef.current) {
      // Classic Isometric Camera Orientation:
      // ~35 degrees tilt on X, 45 degrees rotation on Y
      rootGroupRef.current.rotation.x = 0.61 + currentRotation.current.x; // ~35 deg tilt
      rootGroupRef.current.rotation.y = -Math.PI / 4 + currentRotation.current.y; // -45 deg isometric
      rootGroupRef.current.rotation.z = floatRoll;
      rootGroupRef.current.position.y = floatOffsetY;
    }

    // 3. Scroll-Controlled Vertical Layer Explosion:
    // At scrollProgress <= 0.10: completely assembled stack (separation = 0)
    // As scrollProgress increases to 0.85: layers expand vertically
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

    // Apply vertical separation to each of the 5 layers
    for (let i = 0; i < TOTAL_LAYERS; i++) {
      const layer = layerRefs.current[i];
      if (layer) {
        // Interpolate between assembled stacked Y and dispersed exploded Y
        const targetY = THREE.MathUtils.lerp(assembledY[i], dispersedY[i], s);
        layer.position.y = targetY;

        // Subtle dynamic floating per layer when separated
        if (s > 0.05) {
          const layerWave = Math.sin(time * 1.5 + i * 1.2) * 0.025 * s;
          layer.position.y += layerWave;
        }
      }
    }

    // Fade in floating data particles between layers when separated
    particlesMat.opacity = Math.min(0.75, s * 0.85);
  });

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      {/* 5 Stacked Isometric Rounded Plates */}
      {Array.from({ length: TOTAL_LAYERS }).map((_, i) => (
        <group
          key={`layer-${i}`}
          ref={(el) => (layerRefs.current[i] = el)}
          position={[0, assembledY[i], 0]}
        >
          {/* Beveled Outer Rim */}
          <mesh
            geometry={plateGeometry}
            material={rimMaterial}
            castShadow
            receiveShadow
          />

          {/* Luminous Inner Basin Plate */}
          <mesh
            geometry={innerDishGeometry}
            material={dishMaterial}
            position={[0, 0.048, 0]}
          />
        </group>
      ))}

      {/* Floating Cyan Data Particles Between Layers */}
      <points geometry={particlesGeo} material={particlesMat} />
    </group>
  );
};
