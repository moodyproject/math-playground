import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './core/Scene';
import Sidebar from './ui/Sidebar';
import type { ModuleId } from './ui/Sidebar';
import EquationDisplay from './ui/EquationDisplay';
import { COLORS } from './helpers/colors';
import VectorSandbox from './modules/VectorSandbox';
import DotProductModule from './modules/DotProduct';
import CrossProductModule from './modules/CrossProduct';
import PlanesAndLinesModule from './modules/PlanesAndLines';
import QuadricSurfacesModule from './modules/QuadricSurfaces';

export default function App() {
  const [active, setActive] = useState<ModuleId>('vectors');
  const [latex, setLatex] = useState('\\text{Select a module}');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, ModuleId> = {
        '1': 'vectors',
        '2': 'dotproduct',
        '3': 'crossproduct',
        '4': 'planes',
        '5': 'quadrics',
      };
      if (map[e.key]) setActive(map[e.key]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: COLORS.background, overflow: 'hidden' }}>
      <Sidebar active={active} onSelect={setActive} />
      <EquationDisplay latex={latex} />
      <div style={{ position: 'absolute', left: 240, top: 0, right: 0, bottom: 0 }}>
        <Canvas camera={{ position: [5, 4, 5], fov: 50 }} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <Scene>
              {active === 'vectors' && <VectorSandbox onLatex={setLatex} />}
              {active === 'dotproduct' && <DotProductModule onLatex={setLatex} />}
              {active === 'crossproduct' && <CrossProductModule onLatex={setLatex} />}
              {active === 'planes' && <PlanesAndLinesModule onLatex={setLatex} />}
              {active === 'quadrics' && <QuadricSurfacesModule onLatex={setLatex} />}
            </Scene>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
