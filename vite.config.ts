import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

function visibilityApi(): Plugin {
  const file = resolve("public/visibility.json");
  return {
    name: "visibility-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== "/__admin/visibility") {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        if (req.method === "GET") {
          void readFile(file, "utf8")
            .catch(() => '{"albums":{}}\n')
            .then((text) => res.end(text));
          return;
        }
        if (req.method === "PUT") {
          const chunks: Buffer[] = [];
          req.on("data", (chunk) => chunks.push(chunk as Buffer));
          req.on("end", () => {
            void (async () => {
              const body = Buffer.concat(chunks).toString("utf8");
              JSON.parse(body);
              await writeFile(file, body);
              res.end(JSON.stringify({ ok: true }));
            })().catch((error: unknown) => {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: String(error) }));
            });
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [visibilityApi()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: true,
  },
});
