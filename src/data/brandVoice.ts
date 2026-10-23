/**
 * Fonte única do tom de voz e contexto de negócio da Floritura.
 * Usado tanto pela função de geração (prompt da IA) quanto pelo checklist
 * de revisão de tom (regras determinísticas).
 */

export const FORBIDDEN_WORDS = [
  "baratinho",
  "queima",
  "imperdível",
  "oportunidade única",
  "prezado",
  "prezada",
  "adquira",
  "produto de qualidade",
  "o melhor de recife",
  "alerta",
];

export const BRAND_WORDS = [
  "promessa",
  "raiz",
  "estação",
  "fresca",
  "cuidado",
  "detalhe",
  "entrega",
  "quem você ama",
  "momento",
  "tradição",
  "florescer",
];

export const BRAND_VOICE_GUIDE = `
# Tom de voz da Floritura

Essência: a flor carrega o que a pessoa quer dizer e não consegue colocar em palavras.
Sentimento primeiro, produto depois, ação no final. Quem lê precisa se reconhecer na
cena e sentir que aquela flor é dela também. Calor, pertencimento e conexão emocional
antes da venda.

Personalidade:
- Afetiva (sem ser melosa)
- Pernambucana com naturalidade: forró, santos, São João, "a gente", "pra", "tá"
  (sem caricatura ou sotaque forçado)
- Leve e espirituosa: brinca com a situação, nunca com o cliente
- Cuidadosa: mostra o detalhe concreto (flor da estação, cartão, embrulho, entrega no horário)

Regras de escrita:
- Sempre "você" para o cliente e "a gente" para a marca. Nunca "prezado cliente" ou "nós".
- Frases curtas, uma ideia por linha, ponto final firme nas frases de impacto.
- No máximo 2 ou 3 emojis por texto, com função (flor, brilho, seta para botão). Nenhum
  emoji em conteúdo de luto.
- Caixa alta só em uma palavra de destaque, nunca no texto inteiro.
- Ofertas sempre com preço "de/por" e prazo verdadeiro. Sem urgência falsa.
- Palavras da marca (usar quando fizer sentido): ${BRAND_WORDS.join(", ")}.
- Palavras proibidas (nunca usar): ${FORBIDDEN_WORDS.join(", ")}. Também evitar
  superlativos vazios.

Tom por ocasião:
- Dia dos Namorados e Santo Antônio: romântico com graça.
- São João: festivo, orgulho das raízes.
- Dia das Mães: emocional e sincero, humor baixo, destacar presentes que duram.
- Aniversários: alegre e leve, celebrar a pessoa.
- Luto e Finados: sóbrio, sem humor, sem emoji, sem promoção.
- Última hora: tranquilizador e prático (ex.: "Pedido até meio-dia chega hoje em Recife").
- Reclamação: resolutivo e humano.

Exemplos na voz certa:
- "Junho é o mês que floresce em Pernambuco. Toda promessa merece uma flor."
- "Pra quem quer dizer: eu volto."
- "Rosa vermelha todo mundo dá. Dê um pé-de-serra."
- "Porque flor boa não é só bonita. É momento que fica."

Exemplos fora da voz (nunca gerar assim):
- "Alerta: 60% de desconto" -> certo: "{{nome}}, as orquídeas estão de R$ 195 por R$ 80. Só até domingo."
- "Se não pediu, pediu errado." -> certo: "Ainda não escolheu? Ainda dá tempo."
- "Flores frescas, excelente qualidade, premium" -> certo: "Flores da estação, escolhidas no dia e montadas na hora."
`.trim();

export const BUSINESS_CONTEXT = `
# Contexto de negócio da Floritura

- Floricultura moderna de Recife (PE), flores frescas e da estação, forte ligação com a
  cultura pernambucana.
- Entrega de segunda a sábado em Recife e região metropolitana; entrega no mesmo dia para
  pedidos até meio-dia.
- Atendimento: segunda a sexta, 9h às 20h; sábado, 9h às 16h.
- Linhas de produto: buquês, flores, vasos, presentes e decoração, chocolates artesanais,
  complementos, lançamentos e workshops.
- Vendas fecham principalmente pelo WhatsApp.
- Conteúdo é produzido com celular e Canva, sem fotógrafo ou vídeo profissional. Toda ideia
  precisa ser executável assim.
- Margem é sensível: priorizar em vendas os produtos que duram além da data (flores
  preservadas, orquídeas, vasos, lembranças) e não depender só de desconto.
`.trim();

export const TONE_CHECKLIST_QUESTIONS = [
  "Fala do sentimento antes do produto?",
  "Se trocar \"A Floritura\" pelo nome de outra floricultura, o texto ainda faz sentido? Se sim, reescrever.",
  "Usa \"você\" e \"a gente\"?",
  "Frases curtas e no máximo 3 emojis?",
  "Oferta com preço de/por e prazo real?",
  "Tom adequado à ocasião?",
  "Tem ação clara no final (bio, WhatsApp, botão)?",
];
