import { OrbitControls } from '@react-three/drei';
import Grid from './Grid';

export default function Scene({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
      <Grid />
      {/* Axis helper */}
      <axesHelper args={[5]} />
      {children}
    </>
  );
}
