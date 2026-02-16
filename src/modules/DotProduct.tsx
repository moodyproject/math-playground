import { useState, useEffect } from 'react';
import * as THREE from 'three';
import Arrow from '../ui/Arrow';
import DraggablePoint from '../ui/DraggablePoint';
import { COLORS } from '../helpers/colors';
import { angleBetween, projectOnto } from '../helpers/math';
import { Line } from '@react-three/drei';

interface Props {
  onLatex: (s: string) => void;
}

export default function DotProduct({ onLatex }: Props) {
  const [tipA, setTipA] = useState(new THREE.Vector3(3, 1, 0));
  const [tipB, setTipB] = useState(new THREE.Vector3(1, 3, 0.5));

  const dot = tipA.dot(tipB);
  const angle = angleBetween(tipA, tipB);
  const proj = projectOnto(tipA, tipB);
  const origin = new THREE.Vector3(0, 0, 0);

  useEffect(() => {
    const deg = THREE.MathUtils.radToDeg(angle);
    onLatex(
      `\\vec{a} \\cdot \\vec{b} = ${dot.toFixed(2)} \\\\[6pt]` +
      `|\\vec{a}| = ${tipA.length().toFixed(2)}, \\quad |\\vec{b}| = ${tipB.length().toFixed(2)} \\\\[6pt]` +
      `\\theta = ${deg.toFixed(1)}^\\circ \\\\[6pt]` +
      `\\text{proj}_{\\vec{b}}\\vec{a} = ${proj.length().toFixed(2)}`
    );
  }, [tipA, tipB, dot, angle, proj, onLatex]);

  // Build angle arc points
  const arcPoints: THREE.Vector3[] = [];
  const arcRadius = 0.6;
  const aNorm = tipA.clone().normalize();
  const bNorm = tipB.clone().normalize();
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const v = aNorm.clone().lerp(bNorm.clone(), t).normalize().multiplyScalar(arcRadius);
    arcPoints.push(v);
  }

  return (
    <group>
      <Arrow from={origin} to={tipA} color={COLORS.vectorA} label="a" />
      <Arrow from={origin} to={tipB} color={COLORS.vectorB} label="b" />
      <DraggablePoint position={tipA} onDrag={setTipA} color={COLORS.vectorA} />
      <DraggablePoint position={tipB} onDrag={setTipB} color={COLORS.vectorB} />

      {/* Projection (dashed) */}
      <Arrow from={origin} to={proj} color="#ffdd57" dashed label="proj" />
      {/* Perpendicular line from tipA to projection */}
      <Line points={[tipA.toArray(), proj.toArray()]} color="#ffdd57" lineWidth={1} dashed dashSize={0.1} gapSize={0.05} />

      {/* Angle arc */}
      {arcPoints.length > 1 && (
        <Line
          points={arcPoints.map(p => p.toArray() as [number, number, number])}
          color="#ff9f43"
          lineWidth={2}
        />
      )}
    </group>
  );
}
