import { useEffect, useRef, type ReactNode } from "react";

/** Shared dialog. The opener is captured before showModal and restored on close. */
export function ReaderModal({
  open,
  labelledBy,
  onClose,
  children,
}: {
  open: boolean;
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (opener && opener.isConnected && !dialog.contains(opener)) opener.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <dialog ref={ref} className="read-dialog" aria-labelledby={labelledBy} onClose={onClose}>
      {children}
    </dialog>
  );
}
