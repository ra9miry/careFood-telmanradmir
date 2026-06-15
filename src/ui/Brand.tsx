export function Brand({ wordmark = true }: { wordmark?: boolean }) {
  return (
    <span className="brand">
      <span className="brand__glyph" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
          <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="44" />
            <line x1="27" y1="26" x2="27" y2="44" />
            <line x1="36" y1="26" x2="36" y2="44" />
            <line x1="45" y1="26" x2="45" y2="44" />
          </g>
          <circle cx="45" cy="20" r="4" fill="var(--accent)" />
        </svg>
      </span>
      {wordmark && <span className="brand__word">Telmanradmir</span>}
    </span>
  );
}
