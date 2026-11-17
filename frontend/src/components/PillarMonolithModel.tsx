import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface PillarMonolithModelProps {
  scrollProgress: number; // 0 to 1
  mousePos: { x: number; y: number }; // -1 to 1
  onLidClick?: (index: number) => void;
}

const PILLAR_COUNT = 6;

// Tooltip metadata corresponding to the 6 Core Capabilities of BYAnltiX
const LID_TOOLTIPS = [
  { step: '01', title: 'Universal Ingestion' },
  { step: '02', title: 'Automated Profiling' },
  { step: '03', title: 'Data Quality Audit' },
  { step: '04', title: 'Dynamic Analytics' },
  { step: '05', title: 'Data Visualization' },
  { step: '06', title: 'Intelligent Insights' },
];

// Balanced ascending top Y-positions so all 6 columns display their 3D top surface like the leftmost column
const PILLAR_TOP_Y = [-1.65, -0.95, -0.25, 0.45, 1.15, 1.85];

// Target levitation offsets when scrolled (generous upward elevation)
const DISPERSED_CAP_OFFSETS = [0.85, 1.20, 1.60, 2.00, 2.40, 2.80];

export const PillarMonolithModel: React.FC<PillarMonolithModelProps> = ({
  scrollProgress,
  mousePos,
  onLidClick,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const capRefs = useRef<(THREE.Group | null)[]>([]);
  const [hoveredLid, setHoveredLid] = useState<number | null>(null);
  const hoverElevations = useRef<number[]>([0, 0, 0, 0, 0, 0]);

  // 1. Procedural Fluted Metallic Texture for the front face vertical pinstripes
  const flutedTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#8080ff';
      ctx.fillRect(0, 0, 256, 256);
      for (let x = 0; x < 256; x += 4) {
        const grad = ctx.createLinearGradient(x, 0, x + 4, 0);
        grad.addColorStop(0, '#5050ff');
        grad.addColorStop(0.5, '#c0c0ff');
        grad.addColorStop(1, '#5050ff');
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, 4, 256);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 36);
    return texture;
  }, []);

  // 2. Front Face Material (Clean 100% Matte, Zero Shine from front)
  const flutedFrontMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x707886), // Architectural slate grey
      metalness: 0.18,
      roughness: 0.72, // Pure matte finish
      normalMap: flutedTexture,
      normalScale: new THREE.Vector2(0.45, 0.45),
      clearcoat: 0.0, // Zero clearcoat — no shine from front
      reflectivity: 0.10,
    });
  }, [flutedTexture]);

  // 3. Side & Back Shadow Grey Material (Natural 3D depth)
  const chromeSideMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x4e5562), // Balanced medium-dark shadow tone
      metalness: 0.30,
      roughness: 0.60,
      clearcoat: 0.0,
      reflectivity: 0.15,
    });
  }, []);

  // 4. Horizontal Grid Plate Texture for the pillar top face
  const topPlateTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4e5562';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#707886';
      ctx.lineWidth = 1.0;
      for (let i = 0; i <= 128; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(128, i);
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }, []);

  // Top Face Material with slightly darker tone
  const topPlateMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x5c6370),
      map: topPlateTexture,
      metalness: 0.22,
      roughness: 0.60,
      clearcoat: 0.0,
    });
  }, [topPlateTexture]);

  // Pillar multi-material array: [right, left, top, bottom, front, back]
  const pillarMaterials = useMemo(() => {
    return [
      chromeSideMaterial,   // right face (polished obsidian)
      chromeSideMaterial,   // left face (polished obsidian mirror)
      topPlateMaterial,     // top face (completely closed horizontal plate)
      chromeSideMaterial,   // bottom face
      flutedFrontMaterial,  // front face (vertical fluted metallic pinstripes)
      chromeSideMaterial,   // back face
    ];
  }, [chromeSideMaterial, topPlateMaterial, flutedFrontMaterial]);

  // 5. Slightly Darker Glass Material with High-Gloss Shiny Finish for the Floating Lids
  const crystalGlassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x94a2b6), // Slightly darker smoky crystal tone
      transmission: 0.93, // Optical glass transmission
      opacity: 0.98,
      transparent: true,
      ior: 1.55, // Crown optical crystal glass
      roughness: 0.05, // High-gloss shiny polished glass finish
      metalness: 0.04,
      thickness: 1.25, // Volumetric depth
      attenuationColor: new THREE.Color(0x324258), // Slightly darker smoky core
      attenuationDistance: 1.35,
      clearcoat: 1.0, // Full shiny mirror clearcoat
      clearcoatRoughness: 0.03, // Crisp specular reflections
      reflectivity: 0.98,
      emissive: new THREE.Color(0x121a28),
      emissiveIntensity: 0.16,
    });
  }, []);

  // 6. Polished Chrome Bezel Rim for the Shiny Glass Lids
  const glassBezelMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xdde4f0), // Polished platinum silver
      metalness: 0.97,
      roughness: 0.05, // Mirror shiny rim
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
    });
  }, []);

  // Pillar dimensions and positions spanning across the screen with ascending staircase
  const pillarConfigs = useMemo(() => {
    const width = 1.68; // Wide columns filling horizontal area
    const depth = 1.40;
    const bottomY = -7.5; // Extends well past the bottom edge of the screen

    return Array.from({ length: PILLAR_COUNT }).map((_, i) => {
      // Centers spaced to span across the screen with all 6 columns in ascending sequence
      const x = (i - 2) * 2.05;
      const z = -(i - 2) * 0.70;
      const topY = PILLAR_TOP_Y[i];
      const height = topY - bottomY;
      const centerY = bottomY + height / 2;

      return { i, x, y: centerY, z, topY, height, width, depth };
    });
  }, []);

  // Scroll separation interpolation
  const currentSeparation = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (rootGroupRef.current) {
      // Completely fixed architectural orientation — NO mouse movement or rotation
      rootGroupRef.current.rotation.x = 0.22;
      rootGroupRef.current.rotation.y = -0.32;
      rootGroupRef.current.rotation.z = 0;
      rootGroupRef.current.position.y = 0;
    }

    // Fast Scroll-Controlled Levitation of the Frosted Glass Caps:
    // At scrollProgress === 0: ALL caps are COMPLETELY CLOSED flush on the pillars (separation = 0)
    // As soon as the user rotates the scroll wheel, caps immediately and quickly lift upward into the air
    let targetSep = 0;
    if (scrollProgress <= 0.005) {
      targetSep = 0;
    } else {
      // Rapid upward acceleration curve: reaches full elevation swiftly by scrollProgress ~0.40
      const t = Math.min(1, Math.max(0, scrollProgress / 0.40));
      targetSep = t * t * (3 - 2 * t);
    }

    // High damping factor (11.0) ensures instant, fast tracking of the scroll wheel without sluggish lag
    currentSeparation.current = THREE.MathUtils.damp(
      currentSeparation.current,
      targetSep,
      11.0,
      delta
    );

    const s = currentSeparation.current;

    // Position each of the crystal glass caps
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const cap = capRefs.current[i];
      if (cap) {
        const dispOffset = DISPERSED_CAP_OFFSETS[i];
        // At s = 0: offset is exactly 0.0 (completely closed flush on pillar top!)
        const currentOffset = s * dispOffset;

        const baseTopY = pillarConfigs[i].topY;
        const hoverWave = s > 0.01 ? Math.sin(time * 1.8 + i * 1.2) * 0.018 * s : 0;

        // Smooth extra lift when this specific lid is hovered by the mouse
        const targetHover = hoveredLid === i ? 0.16 : 0;
        hoverElevations.current[i] = THREE.MathUtils.damp(
          hoverElevations.current[i] || 0,
          targetHover,
          10.0,
          delta
        );

        // Height of cap slab is 0.22, so center is baseTopY + 0.11 + currentOffset + hoverWave + hoverElevations
        cap.position.y = baseTopY + 0.11 + currentOffset + hoverWave + hoverElevations.current[i];
        cap.rotation.y = s * 0.08 * (i % 2 === 0 ? 1 : -1);
      }
    }
  });

  return (
    <group ref={rootGroupRef} position={[-1.90, 0, 0]}>
      {pillarConfigs.map((p, i) => (
        <group key={`pillar-${i}`} position={[p.x, 0, p.z]}>
          {/* Vertical Stepped Monolith Pillar */}
          <mesh
            position={[0, p.y, 0]}
            material={pillarMaterials}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onLidClick?.(i);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredLid(i);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHoveredLid((curr) => (curr === i ? null : curr));
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[p.width, p.height, p.depth]} />
          </mesh>

          {/* Top Plate Beveled Trim */}
          <mesh position={[0, p.topY + 0.008, 0]}>
            <boxGeometry args={[p.width * 0.98, 0.016, p.depth * 0.98]} />
            <meshPhysicalMaterial
              color={0x565d6a}
              metalness={0.25}
              roughness={0.55}
            />
          </mesh>

          {/* Floating Optical Crystal Glass Cube Cap (Click to open About Us) */}
          <group
            ref={(el) => (capRefs.current[i] = el)}
            position={[0, p.topY + 0.11, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onLidClick?.(i);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredLid(i);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredLid((curr) => (curr === i ? null : curr));
              document.body.style.cursor = 'default';
            }}
          >
            {/* Main Solid Horizontal Crystal Glass Slab */}
            <mesh material={crystalGlassMaterial} castShadow>
              <boxGeometry args={[p.width * 0.96, 0.22, p.depth * 0.96]} />
            </mesh>

            {/* Horizontal Bezel Borders Framing the Glass Cap */}
            <mesh position={[0, -0.10, 0]} material={glassBezelMaterial}>
              <boxGeometry args={[p.width * 0.98, 0.024, p.depth * 0.98]} />
            </mesh>
            <mesh position={[0, 0.10, 0]} material={glassBezelMaterial}>
              <boxGeometry args={[p.width * 0.98, 0.024, p.depth * 0.98]} />
            </mesh>

            {/* 3D Holographic Monospace Tooltip on Hover */}
            {hoveredLid === i && (
              <Html
                center
                position={[0, 0.52, 0]}
                className="pointer-events-none select-none z-50"
              >
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#121418]/95 border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_15px_rgba(255,255,255,0.12)] whitespace-nowrap backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                  <span className="font-mono text-xs text-white tracking-widest uppercase font-semibold">
                    {LID_TOOLTIPS[i].step} · {LID_TOOLTIPS[i].title}
                  </span>
                  <span className="text-[10px] font-mono text-[#92969E] pl-1 border-l border-white/20">
                    CLICK TO EXPLORE →
                  </span>
                </div>
              </Html>
            )}
          </group>
        </group>
      ))}
    </group>
  );
};
