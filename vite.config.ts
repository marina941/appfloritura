import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * Em desenvolvimento, carrega api/generate.ts via Vite (esbuild) e expõe
 * como middleware em /api/generate, espelhando o comportamento da função
 * serverless usada em produção (Vercel).
 */
function apiDevMiddleware(env: Record<string, string>): Plugin {
  return {
    name: "floritura-api-dev-middleware",
    configureServer(server) {
      for (const [key, value] of Object.entries(env)) {
        if (!process.env[key]) process.env[key] = value;
      }
      server.middlewares.use("/api/generate", async (req, res) => {
        try {
          const mod = await server.ssrLoadModule("/api/generate.ts");
          await mod.default(req, res);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              error: "Erro ao executar a função de geração localmente.",
              details: error instanceof Error ? error.message : String(error),
            }),
          );
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), apiDevMiddleware(env)],
  };
});
