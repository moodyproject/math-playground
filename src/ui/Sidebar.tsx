import { COLORS } from '../helpers/colors';

const modules = [
  { id: 'vectors', label: '1. Vector Sandbox', icon: '🏹' },
  { id: 'dotproduct', label: '2. Dot Product', icon: '🔵' },
  { id: 'crossproduct', label: '3. Cross Product', icon: '✖️' },
  { id: 'planes', label: '4. Planes & Lines', icon: '📐' },
  { id: 'quadrics', label: '5. Quadric Surfaces', icon: '🌀' },
] as const;

export type ModuleId = (typeof modules)[number]['id'];

interface Props {
  active: ModuleId;
  onSelect: (id: ModuleId) => void;
}

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 240,
        background: COLORS.sidebar,
        borderRight: `1px solid ${COLORS.grid}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        zIndex: 100,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          padding: '0 20px 20px',
          borderBottom: `1px solid ${COLORS.grid}`,
          marginBottom: 12,
        }}
      >
        <h1
          style={{
            color: COLORS.accent,
            fontSize: 18,
            margin: 0,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Math Playground
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 12, margin: '4px 0 0' }}>
          3D Interactive Learning
        </p>
      </div>

      {modules.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            border: 'none',
            background: active === m.id ? 'rgba(233, 69, 96, 0.15)' : 'transparent',
            color: active === m.id ? COLORS.accent : COLORS.text,
            cursor: 'pointer',
            fontSize: 14,
            textAlign: 'left',
            transition: 'all 0.15s',
            borderLeft: active === m.id ? `3px solid ${COLORS.accent}` : '3px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (active !== m.id) e.currentTarget.style.background = COLORS.sidebarHover;
          }}
          onMouseLeave={(e) => {
            if (active !== m.id) e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: 18 }}>{m.icon}</span>
          {m.label}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ padding: '12px 20px', color: COLORS.muted, fontSize: 11 }}>
        Keys 1-5 to switch modules
      </div>
    </div>
  );
}
