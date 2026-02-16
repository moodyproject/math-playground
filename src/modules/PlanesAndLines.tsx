import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import Arrow from '../ui/Arrow';
import DraggablePoint from '../ui/DraggablePoint';
import { COLORS } from '../helpers/colors';
import { Line } from '@react-three/drei';

interface Props {
  onLatex: (s: string) => void;
}

export default function PlanesAndLines({ onLatex }: Props) {
  const [normal, setNormal] = useState(new THREE.Vector3(0, 1, 0.5).normalize());
  const [planePoint, setPlanePoint] = useState(new THREE.Vector3(0, 1, 0));
  const [lineOrigin, setLineOrigin] = useState(new THREE.Vector3(-3, 3, -2));
  const [lineDir, setLineDir] = useState(new THREE.Vector3(1, -0.5, 0.8));

  // Plane: n · (r - p) = 0  =>  ax + by + cz = d
  const d = normal.dot(planePoint);

  // Line-plane intersection: t = (d - n·lineOrigin) / (n·lineDir)
  const nDotDir = normal.dot(lineDir);
  const hasIntersection = Math.abs(nDotDir) > 0.0001;
  const t = hasIntersection ? (d - normal.dot(lineOrigin)) / nDotDir : 0;
  const intersection = hasIntersection
    ? lineOrigin.clone().add(lineDir.clone().multiplyScalar(t))
    : null;

  useEffect(() => {
    const { x: a, y: b, z: c } = normal;
    const lines = [
      `\\text{Plane: } ${a.toFixed(2)}x + ${b.toFixed(2)}y + ${c.toFixed(2)}z = ${d.toFixed(2)}`,
      `\\text{Line: } \\vec{r}(t) = (${lineOrigin.x.toFixed(1)}, ${lineOrigin.y.toFixed(1)}, ${lineOrigin.z.toFixed(1)}) + t(${lineDir.x.toFixed(1)}, ${lineDir.y.toFixed(1)}, ${lineDir.z.toFixed(1)})`,
    ];
    if (intersection) {
      lines.push(`\\text{Intersection at } t = ${t.toFixed(2)}`);
      lines.push(`\\text{Point: } (${intersection.x.toFixed(2)}, ${intersection.y.toFixed(2)}, ${intersection.z.toFixed(2)})`);
    } else {
      lines.push('\\text{Line parallel to plane (no intersection)}');
    }
    onLatex(lines.join(' \\\\[4pt] '));
  }, [normal, planePoint, lineOrigin, lineDir, d, t, intersection, onLatex]);

  // Build plane mesh - a rotated square
  const planeQuat = useMemo(() => {
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize());
  }, [normal]);

  // Line endpoints
  const lineStart = lineOrigin.clone().add(lineDir.clone().multiplyScalar(-5));
  const lineEnd = lineOrigin.clone().add(lineDir.clone().multiplyScalar(5));

  // Normal tip for dragging
  const normalTip = planePoint.clone().add(normal.clone().multiplyScalar(2));

  const handleNormalDrag = (pos: THREE.Vector3) => {
    const newNormal = pos.clone().sub(planePoint).normalize();
    if (newNormal.length() > 0.1) setNormal(newNormal);
  };

  const handleLineDirDrag = (pos: THREE.Vector3) => {
    const newDir = pos.clone().sub(lineOrigin);
    if (newDir.length() > 0.1) setLineDir(newDir.normalize());
  };

  return (
    <group>
      {/* Plane */}
      <mesh position={planePoint} quaternion={planeQuat}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial
          color="#0f3460"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Normal vector */}
      <Arrow from={planePoint} to={normalTip} color={COLORS.vectorA} label="n" />
      <DraggablePoint position={normalTip} onDrag={handleNormalDrag} color={COLORS.vectorA} />
      <DraggablePoint position={planePoint} onDrag={setPlanePoint} color="#ffdd57" size={0.12} />

      {/* Line */}
      <Line
        points={[lineStart.toArray() as [number, number, number], lineEnd.toArray() as [number, number, number]]}
        color={COLORS.result}
        lineWidth={2}
      />
      <DraggablePoint position={lineOrigin} onDrag={setLineOrigin} color={COLORS.result} size={0.12} />
      <DraggablePoint
        position={lineOrigin.clone().add(lineDir.clone().multiplyScalar(2))}
        onDrag={handleLineDirDrag}
        color={COLORS.result}
      />

      {/* Intersection point */}
      {intersection && (
        <mesh position={intersection}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ff9f43" emissive="#ff9f43" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
}
