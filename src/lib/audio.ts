import type { ToneName } from "@/lib/session";

let context: AudioContext | null = null;

export function unlockAudio(): void {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!context) context = new Ctx();
  if (context.state === "suspended") void context.resume();
}

/** Local synthesised preview tones. Not a ringtone library and not Spotify audio. */
export function playTone(tone: ToneName): void {
  unlockAudio();
  if (!context) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.connect(gain);
  gain.connect(context.destination);
  const start = context.currentTime;
  if (tone === "chime") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, start);
  } else if (tone === "pulse") {
    osc.type = "square";
    osc.frequency.setValueAtTime(440, start);
  } else {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(660, start);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
  osc.start(start);
  osc.stop(start + 0.6);
}
