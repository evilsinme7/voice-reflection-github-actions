import fs from "node:fs";

export function readCaptureInput(env = process.env) {
  let text = env.INPUT_TEXT || "";
  if (!text && env.GITHUB_EVENT_PATH && fs.existsSync(env.GITHUB_EVENT_PATH)) {
    const event = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, "utf8"));
    text = event.client_payload?.text || event.inputs?.text || "";
  }
  text = String(text).trim();
  if (!text) throw new Error("没有收到听写文本");
  if (text.length > 20_000) throw new Error("听写文本超过 20,000 字符限制");
  return text;
}
