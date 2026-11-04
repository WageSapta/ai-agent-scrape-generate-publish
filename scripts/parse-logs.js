const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const inputPath = path.join(rootDir, "ai-logs", "01-raw-transcript.json");
const outputDir = path.join(rootDir, "ai-logs", "readable");

const stopWords = new Set([
  "a", "an", "the", "and", "atau", "dengan", "di", "dari", "dan",
  "ini", "itu", "saya", "kamu", "tolong", "please", "untuk", "ke",
  "file", "folder", "project", "sekarang", "lakukan", "berikut",
  "instruksi", "secara", "telah", "akan", "yang", "agar",
]);

function cleanText(value) {
  return String(value)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .trim();
}

function promptText(request) {
  const message = request?.message;
  if (typeof message?.text === "string" && message.text.trim()) {
    return cleanText(message.text);
  }

  if (Array.isArray(message?.parts)) {
    const text = cleanText(message.parts
      .filter((part) => part?.kind === "text" && typeof part?.text === "string")
      .map((part) => part.text.trim())
      .filter(Boolean)
      .join("\n\n"));
    if (text) return text;
  }

  return "";
}

function slugFromPrompt(prompt) {
  const words = prompt
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter((word) => word && !stopWords.has(word));

  const selected = (words.length > 0 ? words : prompt.toLowerCase().split(/\s+/)).slice(0, 5);
  const slug = selected
    .join("-")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "percakapan";
}

function responseText(response) {
  if (!Array.isArray(response)) return "";

  const sections = [];
  for (const item of response) {
    if (!item || typeof item !== "object") continue;

    if (typeof item.value === "string" && item.value.trim()) {
      sections.push(item.value.trim());
    } else if (typeof item.message === "string" && item.message.trim()) {
      sections.push(item.message.trim());
    }

    const invocation = item.invocationMessage?.value || item.pastTenseMessage?.value;
    if (typeof invocation === "string" && invocation.trim()) {
      sections.push(invocation.trim());
    }

    const output = item.resultDetails?.output;
    if (typeof output === "string" && output.trim()) {
      sections.push(output.trim());
    } else if (Array.isArray(output)) {
      for (const outputItem of output) {
        if (typeof outputItem === "string" && outputItem.trim()) {
          sections.push(outputItem.trim());
        }
      }
    }

    if (typeof item.resultError === "string" && item.resultError.trim()) {
      sections.push(`Error: ${item.resultError.trim()}`);
    }
  }

  const unique = [];
  const seen = new Set();
  for (const section of sections) {
    if (!seen.has(section)) {
      seen.add(section);
      unique.push(section);
    }
  }
  return cleanText(unique.join("\n\n"));
}

function ensureUniqueName(order, slug, usedNames) {
  const base = `${String(order).padStart(2, "0")}-${slug}`;
  let name = base;
  let suffix = 2;
  while (usedNames.has(`${name}.md`)) {
    name = `${base}-${suffix}`;
    suffix += 1;
  }
  usedNames.add(`${name}.md`);
  return `${name}.md`;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Transcript tidak ditemukan: ${inputPath}`);
  }

  const transcript = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  if (!Array.isArray(transcript.requests)) {
    throw new Error("Format transcript tidak memiliki array requests.");
  }

  fs.mkdirSync(outputDir, { recursive: true });
  for (const fileName of fs.readdirSync(outputDir)) {
    const filePath = path.join(outputDir, fileName);
    if (fs.statSync(filePath).isFile() && fileName.endsWith(".md")) {
      fs.unlinkSync(filePath);
    }
  }

  const usedNames = new Set();
  let written = 0;

  transcript.requests.forEach((request, index) => {
    const prompt = promptText(request);
    if (!prompt) return;

    const slug = slugFromPrompt(prompt);
    const response = responseText(request.response).trim();
    const fileName = ensureUniqueName(index + 1, slug, usedNames);
    const markdown = `# Percakapan: ${slug}\n\n## 👤 PROMPT (User)\n${prompt}\n\n## 🤖 RESPONSE (AI Agent)\n${response || "(Tidak ada respons teks yang dapat diekstrak.)"}\n`;

    fs.writeFileSync(path.join(outputDir, fileName), markdown, "utf8");
    written += 1;
  });

  console.log(`Berhasil membuat ${written} file Markdown di ${outputDir}`);
}

main();
