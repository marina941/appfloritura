import { BRAND_VOICE_GUIDE, BUSINESS_CONTEXT } from "../src/data/brandVoice";
import type {
  GenerateRequest,
  GenerateCaptionRequest,
  GenerateIdeaRequest,
  GenerateScriptRequest,
} from "../src/types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

const OBJECTIVE_LABELS: Record<string, string> = {
  alcance:
    "Alcance (atrair): fazer gente nova conhecer a marca. Conteúdos fáceis de compartilhar, " +
    "com gancho forte nos primeiros segundos — Reels de montagem de buquê, curiosidades sobre " +
    "flores, trends adaptadas. Métrica: alcance e seguidores novos.",
  conexao:
    "Conexão (percepção de marca): fazer as pessoas gostarem da marca e se identificarem com " +
    "ela. Bastidores, a história da loja, a dona, a cultura pernambucana, o cuidado com cada " +
    "flor. Métrica: comentários, salvamentos e respostas nos Stories.",
  autoridade:
    "Autoridade (educar): mostrar que a marca entende do assunto, o que justifica o preço e " +
    "gera confiança. Como cuidar de orquídea, significado das flores, flor da estação do mês, " +
    "como escolher o buquê certo. Métrica: salvamento e compartilhamento.",
  conversao:
    "Conversão (vender): levar à compra. Lançamentos, produto da semana, datas comemorativas, " +
    "ofertas, entrega no mesmo dia. Métrica: clique no link, conversa no WhatsApp e venda.",
  fidelizacao:
    "Fidelização (relacionamento): fazer quem já comprou voltar e indicar. Depoimentos e " +
    "reações de clientes, repost de quem recebeu flores, lembrete de datas, convite para " +
    "workshop. Métrica: recompra e menções.",
};

const FORMAT_LABELS: Record<string, string> = {
  reels: "Reels (15 a 45s, cenas numeradas com tempo, gravável com celular)",
  carrossel: "Carrossel (capa com gancho, 4 a 6 slides, último com CTA)",
  estatico: "Post estático (texto da arte + sugestão de foto)",
  stories: "Stories (3 a 5 telas, com enquete ou caixa de pergunta)",
  whatsapp: "Mensagem de WhatsApp (disparo, com {{nome}} no início)",
};

const REFINEMENT_INSTRUCTIONS: Record<string, string> = {
  "mais-emocional":
    "Reescreva aumentando a carga emocional e a conexão humana, sem exagerar " +
    "(nada de melosidade). Mantenha todas as regras de tom.",
  "mais-vendedor":
    "Reescreva deixando a oferta e a ação mais claras e diretas, sem usar urgência " +
    "falsa nem palavras proibidas. Preço de/por e prazo real se houver oferta.",
  "mais-curto":
    "Reescreva de forma mais curta e direta, cortando o que não é essencial, mantendo " +
    "o gancho e o CTA.",
};

function jsonSchema(properties: Record<string, unknown>, required: string[]) {
  return { type: "object", properties, required };
}

function buildIdeaTool() {
  return {
    name: "submit_idea",
    description: "Envia a ideia de post gerada.",
    input_schema: jsonSchema(
      {
        title: { type: "string", description: "Título curto do post." },
        concept: {
          type: "string",
          description: "Conceito em 2 ou 3 frases, na voz da Floritura.",
        },
        why: {
          type: "string",
          description: "Por que esse post serve ao objetivo escolhido.",
        },
      },
      ["title", "concept", "why"],
    ),
  };
}

function buildScriptTool(format: string) {
  const schemas: Record<string, ReturnType<typeof jsonSchema>> = {
    reels: jsonSchema(
      {
        durationSeconds: {
          type: "number",
          description: "Duração total do vídeo, entre 15 e 45 segundos.",
        },
        scenes: {
          type: "array",
          items: jsonSchema(
            {
              time: { type: "string", description: "Ex.: 0-3s" },
              visual: { type: "string", description: "O que aparece na tela." },
              onScreenText: { type: "string", description: "Texto na tela." },
              audio: { type: "string", description: "Sugestão de áudio/trilha." },
            },
            ["time", "visual", "onScreenText", "audio"],
          ),
        },
      },
      ["durationSeconds", "scenes"],
    ),
    carrossel: jsonSchema(
      {
        slides: {
          type: "array",
          minItems: 4,
          maxItems: 6,
          items: jsonSchema(
            { index: { type: "number" }, text: { type: "string" } },
            ["index", "text"],
          ),
        },
      },
      ["slides"],
    ),
    stories: jsonSchema(
      {
        screens: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: jsonSchema(
            {
              index: { type: "number" },
              text: { type: "string" },
              interaction: {
                type: "string",
                description: "Enquete ou caixa de pergunta, se houver.",
              },
            },
            ["index", "text"],
          ),
        },
      },
      ["screens"],
    ),
    estatico: jsonSchema(
      {
        content: jsonSchema(
          {
            artText: { type: "string", description: "Texto da arte." },
            photoSuggestion: {
              type: "string",
              description: "Sugestão de foto, gravável com celular/Canva, sem produção profissional.",
            },
          },
          ["artText", "photoSuggestion"],
        ),
      },
      ["content"],
    ),
    whatsapp: jsonSchema(
      {
        content: jsonSchema(
          {
            message: {
              type: "string",
              description:
                'Mensagem curta com a variável "{{nome}}" logo no início. Se houver oferta, preço de/por.',
            },
            button: { type: "string", description: "Texto do botão." },
          },
          ["message", "button"],
        ),
      },
      ["content"],
    ),
  };

  return {
    name: "submit_script",
    description: "Envia o roteiro gerado, adaptado ao formato do post.",
    input_schema: schemas[format],
  };
}

function buildCaptionTool() {
  return {
    name: "submit_caption",
    description: "Envia a legenda pronta para copiar.",
    input_schema: jsonSchema(
      {
        caption: {
          type: "string",
          description:
            "Legenda seguindo a estrutura AIDA (Atenção, Interesse, Desejo, Ação): gancho " +
            "forte que para o scroll na primeira linha, quebras de linha, CTA claro no final, " +
            "até 5 hashtags.",
        },
      },
      ["caption"],
    ),
  };
}

function buildIdeaPrompt(req: GenerateIdeaRequest): string {
  const lines = [
    `Gere a IDEIA de um post para A Floritura.`,
    `Objetivo: ${OBJECTIVE_LABELS[req.objective]}.`,
    `Formato: ${FORMAT_LABELS[req.format]}.`,
    `Data do post: ${req.date}.`,
  ];
  if (req.occasionName) {
    lines.push(
      `Data comemorativa relacionada: ${req.occasionName}${
        req.occasionTone ? ` (tom: ${req.occasionTone})` : ""
      }.`,
    );
  }
  if (req.recentTitles?.length) {
    lines.push(
      `Não repita ideias recentes. Títulos já usados recentemente: ${req.recentTitles
        .slice(0, 20)
        .join(" | ")}.`,
    );
  }
  if (req.refinement && req.previousIdea) {
    lines.push(
      `Ideia anterior a ajustar: título "${req.previousIdea.title}", conceito "${req.previousIdea.concept}".`,
    );
    lines.push(REFINEMENT_INSTRUCTIONS[req.refinement]);
  } else if (req.previousIdea) {
    lines.push(
      `Gere uma ideia diferente da anterior: "${req.previousIdea.title}".`,
    );
  }
  lines.push(
    `Use a ferramenta submit_idea para responder. Siga rigorosamente o tom de voz da marca.`,
  );
  return lines.join("\n");
}

function buildScriptPrompt(req: GenerateScriptRequest): string {
  const lines = [
    `Gere o ROTEIRO de um post para A Floritura, adaptado ao formato.`,
    `Objetivo: ${OBJECTIVE_LABELS[req.objective]}.`,
    `Formato: ${FORMAT_LABELS[req.format]}.`,
    `Ideia do post: título "${req.idea.title}". Conceito: ${req.idea.concept}`,
  ];
  if (req.refinement && req.previousScript) {
    lines.push(`Roteiro anterior a ajustar: ${JSON.stringify(req.previousScript)}.`);
    lines.push(REFINEMENT_INSTRUCTIONS[req.refinement]);
  } else if (req.previousScript) {
    lines.push(`Gere uma variação diferente do roteiro anterior.`);
  }
  lines.push(
    `Tudo precisa ser gravável com celular e Canva, sem produção profissional.`,
  );
  lines.push(
    `Use a ferramenta submit_script para responder. Siga rigorosamente o tom de voz da marca.`,
  );
  return lines.join("\n");
}

function buildCaptionPrompt(req: GenerateCaptionRequest): string {
  const lines = [
    `Gere a LEGENDA de um post para A Floritura, pronta para copiar.`,
    `Objetivo: ${OBJECTIVE_LABELS[req.objective]}.`,
    `Formato: ${FORMAT_LABELS[req.format]}.`,
    `Ideia do post: título "${req.idea.title}". Conceito: ${req.idea.concept}`,
  ];
  if (req.refinement && req.previousCaption) {
    lines.push(`Legenda anterior a ajustar: "${req.previousCaption}".`);
    lines.push(REFINEMENT_INSTRUCTIONS[req.refinement]);
  } else if (req.previousCaption) {
    lines.push(`Gere uma variação diferente da legenda anterior.`);
  }
  lines.push(
    `A legenda precisa seguir a estrutura AIDA:`,
    `- Atenção: gancho forte na primeira linha, que para o scroll (pergunta, afirmação ` +
      `inesperada ou cena que gera identificação). Nunca comece com o nome do produto.`,
    `- Interesse: desenvolva a ideia, mostre por que aquilo importa pra quem está lendo.`,
    `- Desejo: conecte com o sentimento ou o resultado — faça a pessoa se imaginar vivendo ` +
      `aquela cena.`,
    `- Ação: feche com um CTA claro (link na bio, chama no WhatsApp, comente, etc.).`,
    `Use quebras de linha entre os blocos e até 5 hashtags no final.`,
  );
  lines.push(
    `Use a ferramenta submit_caption para responder. Siga rigorosamente o tom de voz da marca.`,
  );
  return lines.join("\n");
}

function buildPromptAndTool(req: GenerateRequest) {
  if (req.kind === "idea") return { tool: buildIdeaTool(), prompt: buildIdeaPrompt(req) };
  if (req.kind === "script")
    return { tool: buildScriptTool(req.format), prompt: buildScriptPrompt(req) };
  return { tool: buildCaptionTool(), prompt: buildCaptionPrompt(req) };
}

async function readBody(req: any): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Método não permitido." }));
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error:
          "ANTHROPIC_API_KEY não configurada. Adicione a chave em .env.local (dev) ou nas variáveis de ambiente do projeto (produção).",
      }),
    );
    return;
  }

  let body: GenerateRequest;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Corpo da requisição inválido." }));
    return;
  }

  const { tool, prompt } = buildPromptAndTool(body);
  const system = `${BRAND_VOICE_GUIDE}\n\n${BUSINESS_CONTEXT}`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system,
        messages: [{ role: "user", content: prompt }],
        tools: [tool],
        tool_choice: { type: "tool", name: tool.name },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.statusCode = response.status;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          error: `Erro da API da Anthropic (${response.status}). Verifique se a chave começa com "sk-ant-api03-" e tem créditos disponíveis.`,
          details: errText,
        }),
      );
      return;
    }

    const data = (await response.json()) as { content?: Array<{ type: string; name: string; input: unknown }> };
    const toolUse = (data.content ?? []).find(
      (block: any) => block.type === "tool_use" && block.name === tool.name,
    );

    if (!toolUse) {
      res.statusCode = 502;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({ error: "A IA não retornou um resultado estruturado válido." }),
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ result: toolUse.input }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "Falha ao chamar a API da Anthropic.",
        details: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}
