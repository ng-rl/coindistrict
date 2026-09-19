import { Canvas } from '@react-three/fiber';
import { DistrictBuilding } from '../district-building-kit';
import { RentStatus } from '../types';

interface WebGLBuildingProps {
  ticker: string;
  status: RentStatus;
  height: number;
  isAd?: boolean;
  index: number;
}

const H_MIN = 1.4;
const H_MAX = 3.8;

export function WebGLBuilding({ ticker, status, height, isAd = false }: WebGLBuildingProps) {
  return (
    <div
      className="relative"
      style={{
        width: isAd ? '108px' : '88px',
        height: isAd ? '200px' : '420px',
      }}
    >
      <Canvas
        camera={{ 
          position: [2.5, 2, 3.5], 
          fov: 35,
          near: 0.1,
          far: 100,
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: 0, // NoToneMapping
        }}
        style={{
          background: 'transparent',
          pointerEvents: 'none',
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={0.85}
          castShadow
        />
        <directionalLight 
          position={[-3, 8, -2]} 
          intensity={0.45}
        />
        
        <DistrictBuilding
          height={height}
          status={status}
          isAd={isAd}
          seed={ticker}
          ticker={ticker}
        />
      </Canvas>
    </div>
  );
}

/**
 * Compute log-scaled world height for DistrictBuilding.
 * Host owns log10(volume+ε)→lerp(H_MIN,H_MAX); kit does NOT re-log.
 */
export function computeBuildingHeight(
  volume24h: number,
  streetMinVolume: number,
  streetMaxVolume: number,
): number {
  const epsilon = 1;
  const rawLog = Math.log10(volume24h + epsilon);
  const minLog = Math.log10(streetMinVolume + epsilon);
  const maxLog = Math.log10(streetMaxVolume + epsilon);
  
  // Normalize to 0-1 range
  const normalized = maxLog > minLog 
    ? Math.max(0, Math.min(1, (rawLog - minLog) / (maxLog - minLog)))
    : 0.5;
  
  // Lerp between H_MIN and H_MAX
  return H_MIN + normalized * (H_MAX - H_MIN);
}
