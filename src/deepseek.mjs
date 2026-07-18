import { requestJson } from "./http.mjs";

export function parseJsonObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string") throw new Error("AI 没有返回可解析的 JSON 对象");
  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI 返回值不是 JSON 对象");
  }
  return parsed;
}

export async function deepseekJson({ apiKey, baseUrl, model, prompt, temperature = 0.3 }) {
  const response = await requestJson(
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
        temperature,
        max_tokens: 2_000,
      }),
    },
    { attempts: 3, timeoutMs: 90_000, label: "DeepSeek" },
  );

  const content = response?.choices?.[0]?.message?.content;
  return parseJsonObject(content);
}

export function normalizeCaptureResult(ai, raw) {
  const polished = String(ai.polished || raw).trim();
  const tags = Array.isArray(ai.tags)
    ? ai.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 3)
    : [];
  return {
    raw,
    polished,
    title: String(ai.title || polished || "（空）").trim().slice(0, 40),
    summary: String(ai.summary || "").trim(),
    tags,
  };
}

export function capturePrompt(raw) {
  return `请处理以下来自语音转写的个人感悟。可能缺少标点、存在同音字错误，或中英文专有名词被错误识别。\n\n原始文本：${raw}\n\n只返回 JSON 对象，字段如下：\n- polished：加标点并纠错后的文本。保留原意和说话风格，不扩写、不改变观点。无法确定时采用最接近原文的合理推断。\n- title：一句话标题，不超过20个汉字。\n- tags：1至3个简短标签组成的数组。优先从 AI、商业、投资、健康、生活、灵感 中选，不合适时可新增。\n- summary：一至两句话的要点摘要。`;
}

export function weeklyPrompt(records, dateRange) {
  const lines = records
    .map((record, index) => `${index + 1}. 【${record.title}】${record.content}${record.tags.length ? `（标签：${record.tags.join("、")}）` : ""}`)
    .join("\n");
  return `请基于以下 ${dateRange} 的真实记录生成一份每周思考回顾。保持专业、克制、具体，不虚构内容，不写空泛或情绪化的抒情。\n\n${lines}\n\n只返回 JSON 对象：\n- title：不超过24个汉字的周回顾标题\n- themes：1至5个本周主题组成的字符串数组\n- review：结构清晰的中文正文，包含一句话概述、编号要点，以及一个“值得继续关注”段落`;
}
