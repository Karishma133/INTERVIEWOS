/**
 * useVoiceSentiment.js
 * -----------------------------------------------------------------------
 * Analyzes REAL microphone audio (via the Web Audio API's AnalyserNode —
 * not just the transcript) to estimate speaking steadiness: pause count,
 * volume variance, and pace. This runs alongside SpeechRecognition.
 *
 * IMPORTANT HONESTY NOTE: this is a heuristic approximation of vocal
 * steadiness, not a clinically validated stress/emotion detector. We
 * label it "Vocal Steadiness" rather than claiming to read psychological
 * state, since volume/pause patterns alone can't reliably diagnose
 * confidence or stress — they're just one weak, observable signal.
 * -----------------------------------------------------------------------
 */
import { useRef, useState } from "react";

const SILENCE_THRESHOLD = 8;
const PAUSE_MIN_MS = 600;
const SAMPLE_INTERVAL_MS = 100;

export function useVoiceSentiment() {
  const [analyzing, setAnalyzing] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const volumeSamplesRef = useRef([]);
  const pauseCountRef = useRef(0);
  const silenceStartRef = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      volumeSamplesRef.current = [];
      pauseCountRef.current = 0;
      silenceStartRef.current = null;
      setAnalyzing(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      intervalRef.current = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const centered = dataArray[i] - 128;
          sumSquares += centered * centered;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        volumeSamplesRef.current.push(rms);

        const now = Date.now();
        if (rms < SILENCE_THRESHOLD) {
          if (silenceStartRef.current === null) silenceStartRef.current = now;
          else if (now - silenceStartRef.current >= PAUSE_MIN_MS && now - silenceStartRef.current < PAUSE_MIN_MS + SAMPLE_INTERVAL_MS) {
            pauseCountRef.current += 1;
          }
        } else {
          silenceStartRef.current = null;
        }
      }, SAMPLE_INTERVAL_MS);
    } catch (err) {
      console.error("Microphone access failed:", err.message);
    }
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close().catch(() => {});
    setAnalyzing(false);

    const samples = volumeSamplesRef.current;
    if (samples.length === 0) return { pauseCount: 0, volumeVariance: 0, steadinessScore: 50 };

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
    const steadinessScore = Math.max(0, Math.min(100, 100 - Math.round(variance / 4) - pauseCountRef.current * 5));

    return { pauseCount: pauseCountRef.current, volumeVariance: Math.round(variance), steadinessScore };
  };

  return { start, stop, analyzing };
}
