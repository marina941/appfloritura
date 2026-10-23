import type { Format, Objective, PostStatus } from "../types";

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  alcance: "Alcance",
  conexao: "Conexão",
  autoridade: "Autoridade",
  conversao: "Conversão",
  fidelizacao: "Fidelização",
};

export const OBJECTIVE_COLORS: Record<
  Objective,
  { badge: string; cardBg: string; border: string; pill: string }
> = {
  alcance: {
    badge: "bg-magenta-light text-magenta",
    cardBg: "bg-magenta-light",
    border: "border-magenta/15",
    pill: "bg-magenta",
  },
  conexao: {
    badge: "bg-sage-light text-leaf",
    cardBg: "bg-sage-light",
    border: "border-sage/15",
    pill: "bg-sage",
  },
  autoridade: {
    badge: "bg-leaf/15 text-leaf",
    cardBg: "bg-leaf/10",
    border: "border-leaf/25",
    pill: "bg-leaf",
  },
  conversao: {
    badge: "bg-magenta text-white",
    cardBg: "bg-magenta/20",
    border: "border-magenta/35",
    pill: "bg-magenta",
  },
  fidelizacao: {
    badge: "bg-sage text-white",
    cardBg: "bg-sage/20",
    border: "border-sage/35",
    pill: "bg-sage",
  },
};

export const FORMAT_LABELS: Record<Format, string> = {
  reels: "Reels",
  carrossel: "Carrossel",
  estatico: "Post estático",
  stories: "Stories",
  whatsapp: "WhatsApp",
};

export const STATUS_LABELS: Record<PostStatus, string> = {
  ideia: "Ideia",
  producao: "Em produção",
  aprovado: "Aprovado",
  publicado: "Publicado",
};

export const STATUS_ORDER: PostStatus[] = [
  "ideia",
  "producao",
  "aprovado",
  "publicado",
];
