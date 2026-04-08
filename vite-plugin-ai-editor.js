import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// Files the AI editor is allowed to touch
const ALLOWED_DIRS = ["src/", "public/"];

function isAllowed(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  return ALLOWED_DIRS.some((d) => rel.startsWith(d));
}

function readProjectContext() {
  const files = [
    "src/App.jsx",
    "src/data/journey.js",
    "src/data/lenders.js",
    "src/components/journey/JourneyTracker.jsx",
    "src/components/welcome/WelcomeScreen.jsx",
    "src/components/vault/DocumentVault.jsx",
    "src/components/recommendations/Recommendations.jsx",
  ];
  return files
    .filter((f) => fs.existsSync(path.join(ROOT, f)))
    .map((f) => {
      const content = fs.readFileSync(path.join(ROOT, f), "utf8");
      return `\n\n### ${f}\n\`\`\`jsx\n${content.slice(0, 4000)}${content.length > 4000 ? "\n... (truncated)" : ""}\n\`\`\``;
    })
    .join("");
}

export default function aiEditorPlugin() {
  return {
    name: "ai-editor",
    apply: "serve", // dev only
    configureServer(server) {
      server.middlewares.use("/api/ai-edit", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end("Method not allowed");
          return;
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey || apiKey === "your_key_here") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Add your ANTHROPIC_API_KEY to .env.local" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          try {
            const { prompt } = JSON.parse(body);
            const context = readProjectContext();
            const client = new Anthropic({ apiKey });

            const response = await client.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 4096,
              system: `You are an AI code editor for the First Home Co-Pilot React app.
The user will give you instructions to change the app.

You can edit files by responding with one or more file blocks in this exact format:
<file path="src/path/to/file.jsx">
// full file contents here
</file>

Rules:
- Always output the COMPLETE file contents, not just the changed parts
- Only edit files inside src/ or public/
- Keep the existing code style (inline styles, no Tailwind, same component patterns)
- After file blocks, give a short plain-English summary of what you changed
- If the request is unclear, ask a clarifying question instead of guessing

Current codebase:
${context}`,
              messages: [{ role: "user", content: prompt }],
            });

            const text = response.content[0].text;

            // Parse file blocks
            const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
            const written = [];
            let match;

            while ((match = fileRegex.exec(text)) !== null) {
              const [, relPath, content] = match;
              const absPath = path.join(ROOT, relPath);
              if (isAllowed(absPath)) {
                fs.mkdirSync(path.dirname(absPath), { recursive: true });
                fs.writeFileSync(absPath, content.trim(), "utf8");
                written.push(relPath);
              }
            }

            // Strip file blocks from the reply shown to user
            const reply = text.replace(fileRegex, "").trim();

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ reply, written }));
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}
