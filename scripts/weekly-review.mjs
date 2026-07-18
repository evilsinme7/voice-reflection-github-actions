import { loadConfig } from "../src/config.mjs";
import { deepseekJson, parseJsonObject, weeklyPrompt } from "../src/deepseek.mjs";
import { NotionClient, weeklyProperties } from "../src/notion.mjs";
import { weeklyWindow } from "../src/time.mjs";

async function main() {
  const config = loadConfig("weekly");
  const window = weeklyWindow(new Date(), config.timezone);
  const notion = new NotionClient({ token: config.notionToken, version: config.notionApiVersion });
  const records = await notion.queryReflections(config.dailyDatabaseId, window.startDate);
  console.log(`查询到 ${records.length} 条有效感悟（${window.dateRange}）`);
  if (!records.length) {
    console.log("本周没有有效记录，跳过周回顾。");
    return;
  }

  const ai = parseJsonObject(await deepseekJson({
    apiKey: config.deepseekApiKey,
    baseUrl: config.deepseekBaseUrl,
    model: config.weeklyModel,
    prompt: weeklyPrompt(records, window.dateRange),
    temperature: 0.4,
  }));
  const review = {
    title: String(ai.title || `${window.dateRange} 每周回顾`).slice(0, 60),
    themes: Array.isArray(ai.themes) ? ai.themes.map(String).filter(Boolean).slice(0, 5) : [],
    body: String(ai.review || "").trim(),
    dateRange: window.dateRange,
    generatedDate: window.generatedDate,
    count: records.length,
  };
  if (!review.body) throw new Error("DeepSeek 返回的周回顾正文为空");
  await notion.createPage(config.weeklyDatabaseId, weeklyProperties(review));
  console.log("已成功写入 Notion，每周回顾处理完成。");
}

main().catch((error) => {
  console.error(`周回顾失败：${error.message}`);
  process.exitCode = 1;
});
