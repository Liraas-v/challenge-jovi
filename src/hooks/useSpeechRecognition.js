import { useState, useEffect, useRef, useCallback } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Hook para legendas ao vivo durante gravação de vídeo.
 * Quando enabled fica true, inicia reconhecimento; quando false, para e limpa.
 */
export function useSpeechRecognition(enabled, language) {
  const [caption, setCaption] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const lang = language || "pt-BR";

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const clear = useCallback(() => setCaption(""), []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    if (enabled) {
      setError(null);
      try {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new Recognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = lang;
        rec.onresult = (e) => {
          let text = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          if (text) setCaption((prev) => (prev ? prev + " " + text.trim() : text.trim()));
        };
        rec.onerror = (e) => {
          if (e.error !== "aborted" && e.error !== "no-speech") setError(e.error);
        };
        rec.onend = () => setIsListening(false);
        rec.start();
        recognitionRef.current = rec;
        setIsListening(true);
      } catch (err) {
        setError(err.message);
      }
      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (_) {}
          recognitionRef.current = null;
        }
        setIsListening(false);
        setCaption("");
      };
    } else {
      stop();
      clear();
    }
  }, [enabled, lang]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  return {
    caption,
    isListening,
    error,
    supported: !!SpeechRecognitionAPI,
    start: () => {},
    stop,
    clear,
  };
}
