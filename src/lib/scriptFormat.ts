import type { Script } from "../types";

export function scriptToText(script: Script): string {
  switch (script.format) {
    case "reels":
      return [
        `Duração: ${script.durationSeconds}s`,
        ...script.scenes.map(
          (s) =>
            `[${s.time}] Visual: ${s.visual}\nTexto na tela: ${s.onScreenText}\nÁudio: ${s.audio}`,
        ),
      ].join("\n\n");
    case "carrossel":
      return script.slides
        .map((s) => `Slide ${s.index}: ${s.text}`)
        .join("\n\n");
    case "stories":
      return script.screens
        .map(
          (s) =>
            `Tela ${s.index}: ${s.text}${s.interaction ? `\nInteração: ${s.interaction}` : ""}`,
        )
        .join("\n\n");
    case "estatico":
      return `Texto da arte: ${script.content.artText}\n\nSugestão de foto: ${script.content.photoSuggestion}`;
    case "whatsapp":
      return `Mensagem: ${script.content.message}\n\nBotão: ${script.content.button}`;
  }
}
