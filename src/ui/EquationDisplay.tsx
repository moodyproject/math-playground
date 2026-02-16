import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Props {
  latex: string;
}

export default function EquationDisplay({ latex }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [latex]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        background: 'rgba(15, 15, 35, 0.9)',
        padding: '12px 20px',
        borderRadius: 12,
        border: '1px solid rgba(233, 69, 96, 0.3)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        color: '#eee',
        minWidth: 200,
      }}
      ref={ref}
    />
  );
}
