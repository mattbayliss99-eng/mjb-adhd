/** Decorative stand-in. The PR #8 raster is not embedded while rights are pending. */
export function NodeMark({ large = false }: { large?: boolean }) {
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 320 180"
        role="img"
        aria-label="Abstract connected nodes. Decorative illustration, not a biological pathway."
        className={large ? "h-52 w-full rounded-xl bg-canvas" : "h-28 w-full rounded-xl bg-canvas"}
      >
        <rect width="320" height="180" fill="var(--color-canvas)" />
        <g fill="none" stroke="var(--color-gold)" strokeWidth="1.4">
          <path d="M40 120 L110 48 L190 96 L270 40" />
          <path d="M110 48 L150 140 L230 130" />
          <path d="M70 90 L150 140 L190 96" />
        </g>
        {[
          [40, 120],
          [70, 90],
          [110, 48],
          [150, 140],
          [190, 96],
          [230, 130],
          [270, 40],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="var(--color-gold-2)" />
        ))}
      </svg>
      <figcaption className="mt-2 text-sm text-muted">
        Decorative stand-in for a topic network. Not a biological pathway. The draft hero file is
        not shown: rights are PENDING_PROVENANCE_REVIEW.
      </figcaption>
    </figure>
  );
}
