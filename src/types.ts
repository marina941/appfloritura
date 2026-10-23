export type Objective =
  | "alcance"
  | "conexao"
  | "autoridade"
  | "conversao"
  | "fidelizacao";

export type Format = "reels" | "carrossel" | "estatico" | "stories" | "whatsapp";

export type PostStatus = "ideia" | "producao" | "aprovado" | "publicado";

export type OccasionTone =
  | "romantico"
  | "festivo"
  | "emocional"
  | "alegre"
  | "luto"
  | "ultima-hora"
  | "padrao";

export interface Occasion {
  id: string;
  name: string;
  date: string; // ISO yyyy-mm-dd (start date)
  endDate?: string; // ISO yyyy-mm-dd, for multi-day occasions
  tone: OccasionTone;
  isCustom?: boolean;
  isMourning?: boolean;
}

export interface Idea {
  title: string;
  concept: string;
  why: string;
}

export interface ReelsScene {
  time: string;
  visual: string;
  onScreenText: string;
  audio: string;
}

export interface CarouselSlide {
  index: number;
  text: string;
}

export interface StoriesScreen {
  index: number;
  text: string;
  interaction?: string;
}

export interface StaticContent {
  artText: string;
  photoSuggestion: string;
}

export interface WhatsappContent {
  message: string;
  button: string;
}

export type Script =
  | { format: "reels"; durationSeconds: number; scenes: ReelsScene[] }
  | { format: "carrossel"; slides: CarouselSlide[] }
  | { format: "stories"; screens: StoriesScreen[] }
  | { format: "estatico"; content: StaticContent }
  | { format: "whatsapp"; content: WhatsappContent };

export interface ToneCheckItem {
  id: string;
  label: string;
  passed: boolean;
  suggestion?: string;
}

export interface ToneCheckResult {
  checkedAt: string;
  items: ToneCheckItem[];
  allPassed: boolean;
}

export interface Post {
  id: string;
  date: string; // ISO yyyy-mm-dd
  objective: Objective;
  format: Format;
  occasionId?: string;
  status: PostStatus;
  idea?: Idea;
  script?: Script;
  caption?: string;
  toneCheck?: ToneCheckResult;
  createdAt: string;
  updatedAt: string;
}

export type PeriodMode = "mensal" | "semanal";

export interface PlanSettings {
  objectiveWeights: Record<Objective, number>; // 0-100 cada, pesos relativos (não precisam somar 100)
  postsPerWeekMin: number;
  postsPerWeekMax: number;
}

export interface GenerateIdeaRequest {
  kind: "idea";
  objective: Objective;
  format: Format;
  date: string;
  occasionName?: string;
  occasionTone?: OccasionTone;
  refinement?: "mais-emocional" | "mais-vendedor" | "mais-curto" | null;
  previousIdea?: Idea;
  recentTitles?: string[];
}

export interface GenerateScriptRequest {
  kind: "script";
  objective: Objective;
  format: Format;
  idea: Idea;
  refinement?: "mais-emocional" | "mais-vendedor" | "mais-curto" | null;
  previousScript?: Script;
}

export interface GenerateCaptionRequest {
  kind: "caption";
  objective: Objective;
  format: Format;
  idea: Idea;
  refinement?: "mais-emocional" | "mais-vendedor" | "mais-curto" | null;
  previousCaption?: string;
}

export type GenerateRequest =
  | GenerateIdeaRequest
  | GenerateScriptRequest
  | GenerateCaptionRequest;
