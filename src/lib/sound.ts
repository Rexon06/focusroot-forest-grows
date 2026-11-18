// Tiny chiptune sounds synthesized with WebAudio — no audio files needed.
let ctx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, volume: number, type: OscillatorType = "square") {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * 0.25), t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playSound(kind: "start" | "pause" | "complete" | "click" | "levelup" | "error", volume: number) {
  if (volume <= 0) return;
  switch (kind) {
    case "start":
      tone(523, 0, 0.1, volume);
      tone(784, 0.1, 0.15, volume);
      break;
    case "pause":
      tone(440, 0, 0.12, volume);
      tone(330, 0.1, 0.15, volume);
      break;
    case "click":
      tone(880, 0, 0.05, volume * 0.6);
      break;
    case "error":
      tone(200, 0, 0.18, volume, "sawtooth");
      break;
    case "complete":
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.2, volume));
      tone(1319, 0.5, 0.4, volume, "triangle");
      break;
    case "levelup":
      [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.15, volume));
      break;
  }
}
