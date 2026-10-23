import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Occasion, PlanSettings, Post, PostStatus } from "../types";

interface PlanState {
  posts: Post[];
  customOccasions: Occasion[];
  settings: PlanSettings;
  recentIdeaTitles: string[];

  addPost: (post: Post) => void;
  addPosts: (posts: Post[]) => void;
  updatePost: (id: string, patch: Partial<Post>) => void;
  removePost: (id: string) => void;
  setStatus: (id: string, status: PostStatus) => void;

  addCustomOccasion: (occasion: Occasion) => void;
  removeCustomOccasion: (id: string) => void;

  updateSettings: (patch: Partial<PlanSettings>) => void;

  addRecentTitle: (title: string) => void;
}

const DEFAULT_SETTINGS: PlanSettings = {
  objectiveWeights: {
    alcance: 20,
    conexao: 20,
    autoridade: 15,
    conversao: 30,
    fidelizacao: 15,
  },
  postsPerWeekMin: 3,
  postsPerWeekMax: 4,
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      posts: [],
      customOccasions: [],
      settings: DEFAULT_SETTINGS,
      recentIdeaTitles: [],

      addPost: (post) => set((s) => ({ posts: [...s.posts, post] })),
      addPosts: (posts) => set((s) => ({ posts: [...s.posts, ...posts] })),
      updatePost: (id, patch) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),
      removePost: (id) =>
        set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id
              ? { ...p, status, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      addCustomOccasion: (occasion) =>
        set((s) => ({ customOccasions: [...s.customOccasions, occasion] })),
      removeCustomOccasion: (id) =>
        set((s) => ({
          customOccasions: s.customOccasions.filter((o) => o.id !== id),
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      addRecentTitle: (title) =>
        set((s) => ({
          recentIdeaTitles: [title, ...s.recentIdeaTitles].slice(0, 60),
        })),
    }),
    {
      name: "floritura-content-plan",
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<PlanState> & {
          settings?: Partial<PlanSettings> & { salesBalancePercent?: number };
        };
        if (version < 1) {
          const mapOldObjective = (o: unknown) => (o === "vendas" ? "conversao" : "conexao");
          state.posts = (state.posts ?? []).map((p) => ({
            ...p,
            objective: mapOldObjective(p.objective),
          })) as Post[];
          state.settings = {
            ...DEFAULT_SETTINGS,
            postsPerWeekMin: state.settings?.postsPerWeekMin ?? DEFAULT_SETTINGS.postsPerWeekMin,
            postsPerWeekMax: state.settings?.postsPerWeekMax ?? DEFAULT_SETTINGS.postsPerWeekMax,
          };
        }
        return state as PlanState;
      },
    },
  ),
);
