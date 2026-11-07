import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CONTACT_FORM_ENDPOINT, submitContactForm } from "@/lib/contact-form";

type Phase = "idle" | "submitting" | "success" | "failure";

export function ContactForm({ className, children }: { className?: string; children: ReactNode }) {
  const statusId = useId();
  const alertId = useId();
  const [phase, setPhase] = useState<Phase>("idle");
  const [ready, setReady] = useState(false);
  const sending = useRef(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (phase === "success") statusRef.current?.focus();
    if (phase === "failure") alertRef.current?.focus();
  }, [phase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    const data = new FormData(event.currentTarget);
    setPhase("submitting");
    const result = await submitContactForm(data);
    sending.current = false;
    setPhase(result.ok ? "success" : "failure");
  }

  const describedBy = phase === "failure" ? alertId : statusId;

  return (
    <form
      className={className || "mjb-form"}
      name="contact"
      method="post"
      action={CONTACT_FORM_ENDPOINT}
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      data-contact-ready={ready ? "true" : "false"}
      onSubmit={onSubmit}
      aria-busy={phase === "submitting"}
      aria-describedby={describedBy}
    >
      <fieldset className="contact-fields" disabled={phase === "submitting"}>
        {children}
      </fieldset>
      <p
        id={statusId}
        ref={statusRef}
        tabIndex={-1}
        className="contact-form-status"
        role="status"
        aria-live="polite"
      >
        {phase === "submitting" ? "Sending your message." : null}
        {phase === "success" ? "Your message was sent. It will be answered by email." : null}
      </p>
      {phase === "failure" ? (
        <p id={alertId} ref={alertRef} tabIndex={-1} className="contact-form-status contact-form-alert" role="alert">
          The message was not sent. Your text is still in the form. You can try again.
        </p>
      ) : null}
    </form>
  );
}
