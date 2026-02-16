import { Grid as DreiGrid } from '@react-three/drei';
import { COLORS } from '../helpers/colors';

export default function Grid() {
  return (
    <DreiGrid
      args={[20, 20]}
      cellSize={1}
      cellThickness={0.5}
      cellColor={COLORS.grid}
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#1e3a5f"
      fadeDistance={30}
      infiniteGrid
    />
  );
}
