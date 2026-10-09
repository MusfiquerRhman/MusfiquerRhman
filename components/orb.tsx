export function Orb() {
  return (
    <svg className="orb" viewBox="0 0 480 400" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="orb-glow">
          <stop stopColor="#b1f359" stopOpacity=".17" />
          <stop offset="1" stopColor="#b1f359" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="orb-line"
          x1="100"
          y1="70"
          x2="370"
          y2="330"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d0ff8e" stopOpacity=".9" />
          <stop offset="1" stopColor="#a9ef58" stopOpacity=".15" />
        </linearGradient>
      </defs>
      <circle cx="240" cy="195" r="190" fill="url(#orb-glow)" />
      <g stroke="url(#orb-line)" strokeWidth=".7">
        <circle cx="240" cy="195" r="126" />
        {[22, 49, 77, 104, 120].map((r) => (
          <ellipse key={`v${r}`} cx="240" cy="195" rx={r} ry="126" />
        ))}
        {[-99, -72, -39, 0, 39, 72, 99].map((y) => (
          <ellipse
            key={`h${y}`}
            cx="240"
            cy={195 + y}
            rx={Math.sqrt(126 ** 2 - y ** 2)}
            ry={13 + (126 - Math.abs(y)) * 0.16}
          />
        ))}
      </g>
      <ellipse
        cx="240"
        cy="195"
        rx="199"
        ry="63"
        transform="rotate(-29 240 195)"
        stroke="#b8f46c"
        strokeOpacity=".4"
        strokeDasharray="3 7"
      />
      <ellipse
        cx="240"
        cy="195"
        rx="175"
        ry="78"
        transform="rotate(38 240 195)"
        stroke="#b8f46c"
        strokeOpacity=".15"
      />
      <g fill="#b1f359">
        <circle cx="93" cy="297" r="4" />
        <circle cx="364" cy="101" r="3" />
        <circle cx="328" cy="295" r="2.5" />
      </g>
      <path
        d="M72 60h18M81 51v18M394 316h18M403 307v18"
        stroke="#b1f359"
        strokeOpacity=".5"
      />
    </svg>
  );
}
