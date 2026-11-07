export function BionicText({ text, on }: { text: string; on: boolean }) {
  if (!on) return <>{text}</>;
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, index) => {
        if (!/\S/.test(part) || part.length < 4) return <span key={index}>{part}</span>;
        const cut = Math.max(1, Math.ceil(part.length * 0.4));
        return (
          <span key={index}>
            <strong className="font-semibold text-ink">{part.slice(0, cut)}</strong>
            {part.slice(cut)}
          </span>
        );
      })}
    </>
  );
}
