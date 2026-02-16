import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';

interface Props {
  position: THREE.Vector3;
  onDrag: (pos: THREE.Vector3) => void;
  color?: string;
  size?: number;
}

export default function DraggablePoint({ position, onDrag, color = '#e94560', size = 0.15 }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { camera, gl } = useThree();
  const plane = useRef(new THREE.Plane());
  const intersection = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.nativeEvent.pointerId);
    // Set drag plane facing camera through point
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    plane.current.setFromNormalAndCoplanarPoint(camDir, position);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.current.setFromCamera(mouse, camera);
    if (raycaster.current.ray.intersectPlane(plane.current, intersection.current)) {
      onDrag(intersection.current.clone());
    }
  };

  const onPointerUp = () => {
    setDragging(false);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerOver={() => { setHovered(true); gl.domElement.style.cursor = 'grab'; }}
      onPointerOut={() => { setHovered(false); if (!dragging) gl.domElement.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[hovered || dragging ? size * 1.3 : size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered || dragging ? 0.6 : 0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
