import type { Post, ToneCheckItem, ToneCheckResult } from "../types";
import { FORBIDDEN_WORDS, BRAND_WORDS } from "../data/brandVoice";

const EMOJI_REGEX =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu;

function getAllText(post: Post): string {
  const parts: string[] = [];
  if (post.idea) parts.push(post.idea.title, post.idea.concept);
  if (post.caption) parts.push(post.caption);
  if (post.script) {
    switch (post.script.format) {
      case "reels":
        post.script.scenes.forEach((s) =>
          parts.push(s.onScreenText, s.audio, s.visual),
        );
        break;
      case "carrossel":
        post.script.slides.forEach((s) => parts.push(s.text));
        break;
      case "stories":
        post.script.screens.forEach((s) => parts.push(s.text));
        break;
      case "estatico":
        parts.push(post.script.content.artText);
        break;
      case "whatsapp":
        parts.push(post.script.content.message);
        break;
    }
  }
  return parts.join("\n").toLowerCase();
}

function countEmojis(text: string): number {
  return (text.match(EMOJI_REGEX) ?? []).length;
}

/** Revisão determinística baseada no checklist de tom de voz da Floritura. */
export function runToneChecklist(post: Post): ToneCheckResult {
  const text = getAllText(post);
  const caption = (post.caption ?? "").toLowerCase();
  const isMourning = post.occasionId?.includes("finados");

  const items: ToneCheckItem[] = [];

  // 1. Fala do sentimento antes do produto? (checa se a ideia/why menciona sentimento)
  const sentimentWords = ["sente", "sentimento", "lembrar", "saudade", "momento", "quem você ama", "carinho", "gratidão"];
  const hasSentiment =
    sentimentWords.some((w) => text.includes(w)) || Boolean(post.idea?.why);
  items.push({
    id: "sentimento-antes",
    label: "Fala do sentimento antes do produto?",
    passed: hasSentiment,
    suggestion: hasSentiment
      ? undefined
      : "Comece pela emoção ou pela cena (quem vai receber, o que isso significa) antes de falar do produto.",
  });

  // 2. Genérico (poderia ser qualquer floricultura)?
  const hasSpecificDetail =
    /recife|pernambuco|olinda|são joão|forró|pé-de-serra|mesmo dia|meio-dia/.test(
      text,
    );
  items.push({
    id: "nao-generico",
    label: "Tem um detalhe específico da Floritura (não serve pra qualquer floricultura)?",
    passed: hasSpecificDetail,
    suggestion: hasSpecificDetail
      ? undefined
      : "Adicione um detalhe concreto e único: Recife, a estação da flor, a entrega, a cultura pernambucana.",
  });

  // 3. Usa "você" e "a gente"?
  const hasVoce = /\bvocê\b|\bvocê's\b|\btá\b|\bpra\b/.test(text);
  const hasAGente = /\ba gente\b/.test(text);
  items.push({
    id: "voce-a-gente",
    label: 'Usa "você" para o cliente e "a gente" para a marca?',
    passed: hasVoce && hasAGente,
    suggestion:
      hasVoce && hasAGente
        ? undefined
        : 'Troque "nós"/formal por "a gente" e fale diretamente com "você".',
  });

  // 4. Frases curtas e no máximo 3 emojis?
  const emojiCount = countEmojis(caption);
  const maxEmojiOk = isMourning ? emojiCount === 0 : emojiCount <= 3;
  items.push({
    id: "emojis",
    label: isMourning
      ? "Sem emojis (conteúdo de luto)?"
      : "No máximo 2 a 3 emojis, com função?",
    passed: maxEmojiOk,
    suggestion: maxEmojiOk
      ? undefined
      : isMourning
        ? "Remova todos os emojis: conteúdo de Finados deve ser sóbrio."
        : "Reduza para no máximo 3 emojis, cada um com uma função clara.",
  });

  // 5. Oferta com preço de/por e prazo real?
  const mentionsPrice = /r\$/.test(text);
  const hasDePor = /\bde\b[^.\n]*\bpor\b/.test(text) || !mentionsPrice;
  items.push({
    id: "preco-de-por",
    label: "Se tem oferta, usa preço de/por e prazo real?",
    passed: hasDePor,
    suggestion: hasDePor
      ? undefined
      : 'Se há preço, mostre "de R$X por R$Y" com um prazo verdadeiro (ex.: "até domingo").',
  });

  // 6. Palavras proibidas
  const foundForbidden = FORBIDDEN_WORDS.filter((w) => text.includes(w));
  items.push({
    id: "palavras-proibidas",
    label: "Não usa palavras fora do tom (baratinho, imperdível, prezado, alerta...)?",
    passed: foundForbidden.length === 0,
    suggestion:
      foundForbidden.length === 0
        ? undefined
        : `Troque: ${foundForbidden.join(", ")}.`,
  });

  // 7. Caixa alta só em uma palavra (checa se há sequência de 2+ palavras em maiúsculo)
  const originalCaption = post.caption ?? "";
  const allCapsSequence = /\b[A-ZÀ-Ú]{2,}\s+[A-ZÀ-Ú]{2,}/.test(
    originalCaption,
  );
  items.push({
    id: "caixa-alta",
    label: "Caixa alta usada só em no máximo uma palavra de destaque?",
    passed: !allCapsSequence,
    suggestion: allCapsSequence
      ? "Deixe só uma palavra em caixa alta (se precisar de destaque) e o resto em caixa normal."
      : undefined,
  });

  // 8. Tom adequado à ocasião (luto sem humor/promoção)
  const hasPromoInMourning =
    isMourning && /oferta|desconto|promoção|compre|por r\$/.test(text);
  items.push({
    id: "tom-ocasiao",
    label: "Tom adequado à ocasião (ex.: Finados sem humor ou promoção)?",
    passed: !hasPromoInMourning,
    suggestion: hasPromoInMourning
      ? "Remova menções a oferta/promoção: conteúdo de luto não deve vender."
      : undefined,
  });

  // 9. Ação clara no final
  const hasCTA = /whatsapp|link na bio|bio|clique|chama|agende|peça|escolha/.test(
    caption,
  );
  items.push({
    id: "cta",
    label: "Tem ação clara no final (bio, WhatsApp, botão)?",
    passed: hasCTA || !post.caption,
    suggestion: hasCTA || !post.caption
      ? undefined
      : "Feche com uma ação clara: link na bio, chama no WhatsApp ou botão.",
  });

  const allPassed = items.every((i) => i.passed);

  return {
    checkedAt: new Date().toISOString(),
    items,
    allPassed,
  };
}

export { BRAND_WORDS };
