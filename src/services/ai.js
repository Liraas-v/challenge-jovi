import { AI_RULES } from "../constants/theme";

export function matchRule(text) {
  const l = text.toLowerCase();
  return AI_RULES.find((r) => r.t.some((t) => l.includes(t))) || null;
}

export async function callAI(userMsg, targetLangLabel) {
  const rule = matchRule(userMsg);
  if (rule) return { text: rule.reply, suggestedMode: rule.mode };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: `Você é o assistente IA do JoviLens, app de câmera para estudantes. Responda em português, máximo 2 frases, sugira modos disponíveis: Foto, Retrato, Doc, Vídeo, Cinema, Slow, Pano, QR, Traduzir, Objeto, Pro. Idioma de tradução: ${targetLangLabel}.`,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    const d = await res.json();
    return {
      text:
        d.content?.[0]?.text ||
        "Tente: 'retrato profissional', 'escanear caderno' ou 'traduzir texto'.",
      suggestedMode: null,
    };
  } catch {
    return {
      text: "Tente: 'retrato profissional', 'escanear caderno' ou 'modo noturno'.",
      suggestedMode: null,
    };
  }
}

export async function translateWithAI(text, targetLabel) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: `Translate to ${targetLabel}. Return ONLY the translated text. No explanations, no quotes.`,
        messages: [{ role: "user", content: text }],
      }),
    });
    const d = await res.json();
    return d.content?.[0]?.text || text;
  } catch {
    return text;
  }
}
