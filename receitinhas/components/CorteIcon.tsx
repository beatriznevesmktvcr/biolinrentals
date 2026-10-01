import type { Forma } from "@/data/cortes";

/** Desenhos simples e lúdicos para cada tipo de corte. */
export function CorteIcon({ forma, cor, size = 64 }: { forma: Forma; cor: string; size?: number }) {
  const stroke = "rgba(61,58,74,0.35)";
  const common = { stroke, strokeWidth: 2, fill: cor };

  let inner: React.ReactNode;
  switch (forma) {
    case "amassado":
      inner = (
        <>
          <path d="M12 44c6-10 18-14 28-10s14 10 16 14c-8 4-20 6-30 4S14 48 12 44z" {...common} />
          <circle cx="24" cy="40" r="2" fill={stroke} />
          <circle cx="36" cy="38" r="2" fill={stroke} />
          <circle cx="46" cy="42" r="2" fill={stroke} />
        </>
      );
      break;
    case "ralado":
      inner = (
        <>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M${12 + i * 6} ${46 - (i % 2) * 6} q3 -8 6 0`}
              stroke={cor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <path d="M8 50h48" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </>
      );
      break;
    case "palito":
      inner = (
        <>
          <rect x="26" y="8" width="12" height="48" rx="6" {...common} />
          <path d="M14 28 L8 56 M50 28 L56 56" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 3" />
        </>
      );
      break;
    case "meia-lua":
      inner = <path d="M10 40 A22 22 0 0 1 54 40 Z" {...common} />;
      break;
    case "fatia-fina":
      inner = (
        <>
          <ellipse cx="32" cy="34" rx="22" ry="7" {...common} />
          <ellipse cx="32" cy="24" rx="22" ry="7" {...common} />
        </>
      );
      break;
    case "cubinhos":
      inner = (
        <>
          {[
            [14, 18],
            [30, 14],
            [44, 22],
            [18, 36],
            [36, 36],
            [48, 42],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="10" height="10" rx="2" {...common} />
          ))}
        </>
      );
      break;
    case "quartos":
      inner = (
        <>
          <path d="M18 10 a14 20 0 0 0 0 44 L18 10z" {...common} />
          <path d="M26 10 a14 20 0 0 1 0 44 L26 10z" {...common} transform="translate(-4 0)" />
          <path d="M42 10 a14 20 0 0 0 0 44 L42 10z" {...common} transform="translate(4 0)" />
          <path d="M50 10 a14 20 0 0 1 0 44 L50 10z" {...common} />
        </>
      );
      break;
    case "esmagado":
      inner = (
        <>
          <ellipse cx="32" cy="40" rx="22" ry="8" {...common} />
          <path d="M28 10 l4 8 l4 -8" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M32 18 v10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </>
      );
      break;
    case "pedaco-grande":
      inner = (
        <>
          <path d="M10 50 L32 10 L54 50 Z" {...common} />
          <path d="M10 50 h44" stroke="#4caf7a" strokeWidth="6" strokeLinecap="round" />
        </>
      );
      break;
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {inner}
    </svg>
  );
}
