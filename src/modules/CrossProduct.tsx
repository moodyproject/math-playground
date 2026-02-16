import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import Arrow from '../ui/Arrow';
import DraggablePoint from '../ui/DraggablePoint';
import { COLORS } from '../helpers/colors';

interface Props {
  onLatex: (s: string) => void;
}

export default function CrossProduct({ onLatex }: Props) {
  const [tipA, setTipA] = useState(new THREE.Vector3(2, 0, 0));
  const [tipB, setTipB] = useState(new THREE.Vector3(0, 0, 2));

  const cross = useMemo(() => new THREE.Vector3().crossVectors(tipA, tipB), [tipA, tipB]);
  const area = cross.length();
  const origin = new THREE.Vector3(0, 0, 0);

  useEffect(() => {
    const { x: ax, y: ay, z: az } = tipA;
    const { x: bx, y: by, z: bz } = tipB;
    const { x: cx, y: cy, z: cz } = cross;
    onLatex(
      `\\vec{a} \\times \\vec{b} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ ` +
      `${ax.toFixed(1)} & ${ay.toFixed(1)} & ${az.toFixed(1)} \\\\ ` +
      `${bx.toFixed(1)} & ${by.toFixed(1)} & ${bz.toFixed(1)} \\end{vmatrix} \\\\[8pt]` +
      `= (${cx.toFixed(2)},\\, ${cy.toFixed(2)},\\, ${cz.toFixed(2)}) \\\\[6pt]` +
      `|\\vec{a} \\times \\vec{b}| = ${area.toFixed(2)}`
    );
  }, [tipA, tipB, cross, area, onLatex]);

  // Parallelogram vertices: origin, a, a+b, b
  const parallelogramVerts = useMemo(() => {
    const ab = tipA.clone().add(tipB);
    return new Float32Array([
      0, 0, 0,
      tipA.x, tipA.y, tipA.z,
      ab.x, ab.y, ab.z,
      0, 0, 0,
      ab.x, ab.y, ab.z,
      tipB.x, tipB.y, tipB.z,
    ]);
  }, [tipA, tipB]);

  return (
    <group>
      <Arrow from={origin} to={tipA} color={COLORS.vectorA} label="a" />
      <Arrow from={origin} to={tipB} color={COLORS.vectorB} label="b" />
      <Arrow from={origin} to={cross} color={COLORS.result} label={`a×b (${area.toFixed(2)})`} />

      <DraggablePoint position={tipA} onDrag={setTipA} color={COLORS.vectorA} />
      <DraggablePoint position={tipB} onDrag={setTipB} color={COLORS.vectorB} />

      {/* Parallelogram area */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[parallelogramVerts, 3]}
          />
        </bufferGeometry>
        <meshStandardMaterial
          color={COLORS.result}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Parallelogram outline */}
      <Arrow from={tipA} to={tipA.clone().add(tipB)} color={COLORS.vectorB} dashed />
      <Arrow from={tipB} to={tipA.clone().add(tipB)} color={COLORS.vectorA} dashed />
    </group>
  );
}
