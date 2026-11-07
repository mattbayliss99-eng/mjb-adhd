type SpeechHooks = { onend?: () => void; onerror?: () => void; voiceURI?: string };

let ticket = 0;

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

/** Returns false when speech never starts. The caller must not announce playback in that case. */
export function speakChunks(text: string, rate = 1, hooks?: SpeechHooks): boolean {
  if (!canSpeak()) return false;
  const mine = ++ticket;
  let parts: string[];
  try {
    window.speechSynthesis.cancel();
    parts = text.match(/[^.!?]+[.!?]+["”’]?|\S[^.!?]*$/g) ?? [text];
  } catch {
    return false;
  }
  const spoken = parts.map((part) => part.trim()).filter(Boolean);
  if (spoken.length === 0) return false;
  try {
    spoken.forEach((part, index) => {
      const utter = new SpeechSynthesisUtterance(part);
      utter.lang = "en-GB";
      utter.rate = rate;
      if (hooks?.voiceURI) {
        const voice = window.speechSynthesis.getVoices().find((item) => item.voiceURI === hooks.voiceURI);
        if (voice) utter.voice = voice;
      }
      const last = index === spoken.length - 1;
      utter.onend = () => {
        if (mine !== ticket || !last) return;
        hooks?.onend?.();
      };
      utter.onerror = () => {
        if (mine !== ticket) return;
        ticket += 1;
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* already stopped */
        }
        hooks?.onerror?.();
      };
      window.speechSynthesis.speak(utter);
    });
  } catch {
    return false;
  }
  return true;
}

export function stopSpeak(): void {
  ticket += 1;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* nothing was playing */
    }
  }
}

export function pauseSpeak(): boolean {
  if (!canSpeak() || !window.speechSynthesis.speaking || window.speechSynthesis.paused) return false;
  try {
    window.speechSynthesis.pause();
    return window.speechSynthesis.paused;
  } catch {
    return false;
  }
}

export function resumeSpeak(): boolean {
  if (!canSpeak() || !window.speechSynthesis.paused) return false;
  try {
    window.speechSynthesis.resume();
    return !window.speechSynthesis.paused;
  } catch {
    return false;
  }
}
