/** Static file Netlify scans at deploy time. POST here, not at the app catch-all. */
export const CONTACT_FORM_ENDPOINT = "/forms/contact.html";

const CONTACT_FIELDS = ["form-name", "bot-field", "name", "email", "topic", "message"] as const;

/**
 * Post the contact form as URL-encoded form data.
 * Success is only a 2xx response. A thrown request is a failure.
 * The caller must keep the entered text when this returns ok: false.
 */
export async function submitContactForm(
  form: FormData,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean }> {
  const body = new URLSearchParams();
  for (const key of CONTACT_FIELDS) {
    const value = form.get(key);
    body.set(key, typeof value === "string" ? value : "");
  }
  if (!body.get("form-name")) body.set("form-name", "contact");
  try {
    const response = await fetchImpl(CONTACT_FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "text/html" },
      body: body.toString(),
    });
    return { ok: response.ok };
  } catch {
    return { ok: false };
  }
}
