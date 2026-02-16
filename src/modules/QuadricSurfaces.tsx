import { useState, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface Props {
  onLatex: (s: string) => void;
}

type SurfaceType = 'ellipsoid' | 'paraboloid' | 'hyperboloid1' | 'hyperboloid2' | 'saddle' | 'cone';

const SURFACE_LABELS: Record<SurfaceType, string> = {
  ellipsoid: 'Ellipsoid',
  paraboloid: 'Paraboloid',
  hyperboloid1: 'Hyperboloid (1 sheet)',
  hyperboloid2: 'Hyperboloid (2 sheets)',
  saddle: 'Hyperbolic Paraboloid',
  cone: 'Cone',
};

const SURFACE_LATEX: Record<SurfaceType, (a: number, b: number, c: number) => string> = {
  ellipsoid: (a, b, c) => `\\frac{x^2}{${a.toFixed(1)}^2} + \\frac{y^2}{${b.toFixed(1)}^2} + \\frac{z^2}{${c.toFixed(1)}^2} = 1`,
  paraboloid: (a, b, _c) => `z = \\frac{x^2}{${a.toFixed(1)}^2} + \\frac{y^2}{${b.toFixed(1)}^2}`,
  hyperboloid1: (a, b, c) => `\\frac{x^2}{${a.toFixed(1)}^2} + \\frac{y^2}{${b.toFixed(1)}^2} - \\frac{z^2}{${c.toFixed(1)}^2} = 1`,
  hyperboloid2: (a, b, c) => `\\frac{z^2}{${c.toFixed(1)}^2} - \\frac{x^2}{${a.toFixed(1)}^2} - \\frac{y^2}{${b.toFixed(1)}^2} = 1`,
  saddle: (a, b, _c) => `z = \\frac{x^2}{${a.toFixed(1)}^2} - \\frac{y^2}{${b.toFixed(1)}^2}`,
  cone: (a, b, c) => `\\frac{x^2}{${a.toFixed(1)}^2} + \\frac{y^2}{${b.toFixed(1)}^2} = \\frac{z^2}{${c.toFixed(1)}^2}`,
};

function buildSurfaceGeometry(type: SurfaceType, a: number, b: number, c: number): THREE.BufferGeometry {
  const res = 64;
  const vertices: number[] = [];
  const indices: number[] = [];

  const getPoint = (u: number, v: number): [number, number, number] => {
    switch (type) {
      case 'ellipsoid': {
        const phi = u * Math.PI;
        const theta = v * 2 * Math.PI;
        return [
          a * Math.sin(phi) * Math.cos(theta),
          c * Math.cos(phi),
          b * Math.sin(phi) * Math.sin(theta),
        ];
      }
      case 'paraboloid': {
        const r = u * 3;
        const theta = v * 2 * Math.PI;
        const x = a * r * Math.cos(theta);
        const z = b * r * Math.sin(theta);
        return [x, (r * r), z];
      }
      case 'hyperboloid1': {
        const vv = (u - 0.5) * 6;
        const theta = v * 2 * Math.PI;
        const ch = Math.cosh(vv);
        const sh = Math.sinh(vv);
        return [a * ch * Math.cos(theta), c * sh, b * ch * Math.sin(theta)];
      }
      case 'hyperboloid2': {
        const sign = u < 0.5 ? 1 : -1;
        const uu = (u < 0.5 ? u * 2 : (u - 0.5) * 2) * 2 + 0.01;
        const theta = v * 2 * Math.PI;
        const ch = Math.cosh(uu);
        const sh = Math.sinh(uu);
        return [a * sh * Math.cos(theta), c * ch * sign, b * sh * Math.sin(theta)];
      }
      case 'saddle': {
        const x = (u - 0.5) * 6;
        const z = (v - 0.5) * 6;
        return [a * x, (x * x - z * z) * 0.3, b * z];
      }
      case 'cone': {
        const t = (u - 0.5) * 6;
        const theta = v * 2 * Math.PI;
        return [a * Math.abs(t) * Math.cos(theta), c * t, b * Math.abs(t) * Math.sin(theta)];
      }
    }
  };

  for (let i = 0; i <= res; i++) {
    for (let j = 0; j <= res; j++) {
      const [x, y, z] = getPoint(i / res, j / res);
      vertices.push(x, y, z);
    }
  }

  for (let i = 0; i < res; i++) {
    for (let j = 0; j < res; j++) {
      const a0 = i * (res + 1) + j;
      const b0 = a0 + res + 1;
      indices.push(a0, b0, a0 + 1);
      indices.push(b0, b0 + 1, a0 + 1);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export default function QuadricSurfaces({ onLatex }: Props) {
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('ellipsoid');
  const [paramA, setParamA] = useState(1.5);
  const [paramB, setParamB] = useState(1.0);
  const [paramC, setParamC] = useState(1.0);
  const [wireframe, setWireframe] = useState(false);

  useEffect(() => {
    const latex = SURFACE_LATEX[surfaceType](paramA, paramB, paramC);
    onLatex(`\\text{${SURFACE_LABELS[surfaceType]}} \\\\[8pt] ${latex}`);
  }, [surfaceType, paramA, paramB, paramC, onLatex]);

  const geometry = useMemo(
    () => buildSurfaceGeometry(surfaceType, paramA, paramB, paramC),
    [surfaceType, paramA, paramB, paramC],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'w') setWireframe(prev => !prev);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const surfaces: SurfaceType[] = ['ellipsoid', 'paraboloid', 'hyperboloid1', 'hyperboloid2', 'saddle', 'cone'];

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#e94560"
          wireframe={wireframe}
          transparent
          opacity={wireframe ? 0.8 : 0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Cross-section ring at y=0 */}
      {!wireframe && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, 0.02, 64]} />
          <meshBasicMaterial color="#ffdd57" />
        </mesh>
      )}

      {/* HTML UI for controls */}
      <Html position={[-6, 4, 0]} style={{ pointerEvents: 'auto' }}>
        <div style={{
          background: 'rgba(15,15,35,0.92)',
          padding: '16px',
          borderRadius: 12,
          border: '1px solid rgba(233,69,96,0.2)',
          width: 200,
          fontFamily: "'Inter', sans-serif",
          backdropFilter: 'blur(10px)',
        }}>
          <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 8 }}>Surface Type</label>
          <select
            value={surfaceType}
            onChange={e => setSurfaceType(e.target.value as SurfaceType)}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#1a1a2e',
              color: '#eee',
              border: '1px solid rgba(233,69,96,0.3)',
              borderRadius: 6,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {surfaces.map(s => (
              <option key={s} value={s}>{SURFACE_LABELS[s]}</option>
            ))}
          </select>

          {[
            { label: 'a', value: paramA, set: setParamA },
            { label: 'b', value: paramB, set: setParamB },
            { label: 'c', value: paramC, set: setParamC },
          ].map(({ label, value, set }) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 2 }}>
                <span>{label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.1}
                value={value}
                onChange={e => set(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#e94560' }}
              />
            </div>
          ))}

          <button
            onClick={() => setWireframe(w => !w)}
            style={{
              width: '100%',
              padding: '6px',
              background: wireframe ? 'rgba(233,69,96,0.3)' : 'rgba(255,255,255,0.05)',
              color: '#eee',
              border: '1px solid rgba(233,69,96,0.3)',
              borderRadius: 6,
              fontSize: 11,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            {wireframe ? '◼ Solid' : '◻ Wireframe'} (W)
          </button>
        </div>
      </Html>
    </group>
  );
}
