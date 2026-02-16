import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import Arrow from '../ui/Arrow';
import DraggablePoint from '../ui/DraggablePoint';
import { COLORS } from '../helpers/colors';

interface VectorData {
  id: number;
  tip: THREE.Vector3;
  color: string;
}

const VECTOR_COLORS = [COLORS.vectorA, COLORS.vectorB, COLORS.result, '#ff9f43', '#a55eea'];

interface Props {
  onLatex: (s: string) => void;
}

export default function VectorSandbox({ onLatex }: Props) {
  const [vectors, setVectors] = useState<VectorData[]>([
    { id: 0, tip: new THREE.Vector3(2, 1, 0), color: COLORS.vectorA },
    { id: 1, tip: new THREE.Vector3(0, 2, 1), color: COLORS.vectorB },
  ]);
  const [showSum, setShowSum] = useState(true);
  const [nextId, setNextId] = useState(2);

  useEffect(() => {
    if (vectors.length === 0) {
      onLatex('\\text{Click to spawn vectors}');
      return;
    }
    const parts = vectors.map((v, i) => {
      const { x, y, z } = v.tip;
      return `\\vec{v}_{${i + 1}} = (${x.toFixed(1)},\\, ${y.toFixed(1)},\\, ${z.toFixed(1)})`;
    });
    if (showSum && vectors.length >= 2) {
      const sum = vectors.reduce((acc, v) => acc.clone().add(v.tip), new THREE.Vector3());
      parts.push(`\\sum = (${sum.x.toFixed(1)},\\, ${sum.y.toFixed(1)},\\, ${sum.z.toFixed(1)})`);
    }
    onLatex(parts.join(' \\\\[4pt] '));
  }, [vectors, showSum, onLatex]);

  const handleToggleSum = useCallback((e: KeyboardEvent) => {
    if (e.key === 's') setShowSum(prev => !prev);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleToggleSum);
    return () => window.removeEventListener('keydown', handleToggleSum);
  }, [handleToggleSum]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 5) return; // was a drag
    e.stopPropagation();
    const point = e.point.clone();
    const id = nextId;
    setNextId(id + 1);
    setVectors(prev => [...prev, {
      id,
      tip: point,
      color: VECTOR_COLORS[prev.length % VECTOR_COLORS.length],
    }]);
  };

  const updateTip = (id: number, pos: THREE.Vector3) => {
    setVectors(prev => prev.map(v => v.id === id ? { ...v, tip: pos } : v));
  };

  const origin = new THREE.Vector3(0, 0, 0);

  // Sum vector (parallelogram visualization)
  const sumVec = vectors.reduce((acc, v) => acc.clone().add(v.tip), new THREE.Vector3());

  return (
    <group>
      {/* Click plane for spawning */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={handleClick} visible={false}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {vectors.map((v) => (
        <group key={v.id}>
          <Arrow from={origin} to={v.tip} color={v.color} label={`|v| = ${v.tip.length().toFixed(2)}`} />
          <DraggablePoint position={v.tip} onDrag={(p) => updateTip(v.id, p)} color={v.color} />
        </group>
      ))}

      {/* Sum visualization */}
      {showSum && vectors.length >= 2 && (
        <>
          <Arrow from={origin} to={sumVec} color={COLORS.result} label={`Σ = ${sumVec.length().toFixed(2)}`} />
          {/* Parallelogram lines from each vector tip to sum */}
          {vectors.length === 2 && (
            <>
              <Arrow from={vectors[0].tip} to={sumVec} color={COLORS.vectorB} dashed />
              <Arrow from={vectors[1].tip} to={sumVec} color={COLORS.vectorA} dashed />
            </>
          )}
        </>
      )}
    </group>
  );
}
