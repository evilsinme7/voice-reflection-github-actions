import { loadConfig } from "../src/config.mjs";
import { capturePrompt, deepseekJson, normalizeCaptureResult } from "../src/deepseek.mjs";
import { readCaptureInput } from "../src/input.mjs";
import { captureProperties, NotionClient } from "../src/notion.mjs";
import { captureTime } from "../src/time.mjs";

async function main() {
  const config = loadConfig("capture");
  const raw = readCaptureInput();
  const time = captureTime(new Date(), config.timezone);
  console.log(`开始处理一条感悟（${raw.length} 字）`);

  const ai = await deepseekJson({
    apiKey: config.deepseekApiKey,
    baseUrl: config.deepseekBaseUrl,
    model: config.captureModel,
    prompt: capturePrompt(raw),
  });
  const record = { ...normalizeCaptureResult(ai, raw), date: time.iso, period: time.period };
  const notion = new NotionClient({ token: config.notionToken, version: config.notionApiVersion });
  await notion.createPage(config.dailyDatabaseId, captureProperties(record));
  console.log("已成功写入 Notion，每日感悟处理完成。");
}

main().catch((error) => {
  console.error(`处理失败：${error.message}`);
  process.exitCode = 1;
});
