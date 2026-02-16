import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface Props {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color?: string;
  label?: string;
  lineWidth?: number;
  dashed?: boolean;
}

export default function Arrow({ from, to, color = '#e94560', label, lineWidth = 2, dashed = false }: Props) {
  const { direction, length, midpoint, conePos, coneQuat } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const normDir = dir.clone().normalize();
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const coneLength = Math.min(0.3, len * 0.25);
    const cp = to.clone().sub(normDir.clone().multiplyScalar(coneLength * 0.5));
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normDir);
    return { direction: normDir, length: len, midpoint: mid, conePos: cp, coneQuat: quat };
  }, [from, to]);

  const points = useMemo(() => [from, to], [from, to]);

  if (length < 0.01) return null;

  // suppress unused var
  void direction;
  void lineWidth;

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([
              points[0].x, points[0].y, points[0].z,
              points[1].x, points[1].y, points[1].z,
            ]), 3]}
          />
        </bufferGeometry>
        {dashed ? (
          <lineDashedMaterial color={color} dashSize={0.15} gapSize={0.1} />
        ) : (
          <lineBasicMaterial color={color} />
        )}
      </line>

      {/* Arrowhead cone */}
      <mesh position={conePos} quaternion={coneQuat}>
        <coneGeometry args={[0.08, 0.3, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {label && (
        <Html position={midpoint} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,15,35,0.85)',
            color: '#eee',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'nowrap',
            border: `1px solid ${color}33`,
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
