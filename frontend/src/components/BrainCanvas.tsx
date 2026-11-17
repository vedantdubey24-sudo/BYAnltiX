import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PillarMonolithModel } from './PillarMonolithModel';

interface BrainCanvasProps {
  scrollProgress: number;
  mousePos: { x: number; y: number };
  onLidClick?: (index: number) => void;
}

export const BrainCanvas: React.FC<BrainCanvasProps> = ({
  scrollProgress,
  mousePos,
  onLidClick,
}) => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto z-0">
      <Canvas
        camera={{ position: [-0.6, 2.8, 9.5], fov: 40, near: 0.1, far: 100 }}
        onCreated={({ camera }) => camera.lookAt(-0.6, 0.2, 0)}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMappingExposure: 1.25,
        }}
        dpr={[1, 2]}
      >
        {/* Soft Ambient Environment */}
        <ambientLight color="#181e2b" intensity={0.95} />

        {/* Top-Right Soft Key Light */}
        <directionalLight
          position={[6.0, 10.0, 4.0]}
          color="#ffffff"
          intensity={2.8}
        />

        {/* Left Side Fill Light — lifts side faces out of black shadow */}
        <directionalLight
          position={[-6.0, 4.0, 3.0]}
          color="#222a38"
          intensity={1.8}
        />

        {/* Overhead Rim Light — illuminates only the frosted matte caps from above */}
        <directionalLight
          position={[0.0, 9.0, -2.0]}
          color="#e8f0fe"
          intensity={3.2}
        />

        {/* Subtle Background Shine — heavily reduced, faint ambient trace from behind */}
        <pointLight
          position={[-1.2, 1.8, -4.0]}
          color="#a0b8db"
          intensity={0.6}
          distance={8.0}
          decay={1.8}
        />
        <directionalLight
          position={[-1.5, 3.5, -6.5]}
          color="#b8cced"
          intensity={0.35}
        />

        {/* Soft bottom bounce light */}
        <directionalLight
          position={[-2.0, -3.0, 2.0]}
          color="#222834"
          intensity={1.2}
        />

        <Suspense fallback={null}>
          <PillarMonolithModel
            scrollProgress={scrollProgress}
            mousePos={mousePos}
            onLidClick={onLidClick}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
