import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.mjs";
import { normalizeCaptureResult, parseJsonObject } from "../src/deepseek.mjs";
import { captureProperties, NotionClient, reflectionFromPage, richText, weeklyProperties } from "../src/notion.mjs";
import { captureTime, weeklyWindow } from "../src/time.mjs";

test("按上海时区生成日期与时段", () => {
  const result = captureTime(new Date("2026-07-18T04:15:00Z"));
  assert.equal(result.period, "午");
  assert.equal(result.iso, "2026-07-18T12:15:00+08:00");
});

test("每周窗口保持原 n8n 的七天查询规则", () => {
  const result = weeklyWindow(new Date("2026-07-18T00:00:00Z"));
  assert.deepEqual(result, {
    startDate: "2026-07-11",
    generatedDate: "2026-07-18",
    dateRange: "7/12-7/18",
  });
});

test("解析纯 JSON 和 markdown JSON", () => {
  assert.deepEqual(parseJsonObject('{"title":"测试"}'), { title: "测试" });
  assert.deepEqual(parseJsonObject('```json\n{"title":"测试"}\n```'), { title: "测试" });
});

test("AI 结果缺字段时安全回退", () => {
  assert.deepEqual(normalizeCaptureResult({ tags: ["生活", "", "灵感", "多余", "忽略"] }, "原话"), {
    raw: "原话",
    polished: "原话",
    title: "原话",
    summary: "",
    tags: ["生活", "灵感", "多余"],
  });
});

test("Notion 富文本按 2000 字符切分", () => {
  const result = richText("好".repeat(4500));
  assert.deepEqual(result.map((item) => item.text.content.length), [2000, 2000, 500]);
});

test("每日感悟字段映射与现有数据库一致", () => {
  const result = captureProperties({
    title: "标题",
    raw: "原话",
    polished: "内容",
    summary: "摘要",
    tags: ["生活"],
    date: "2026-07-18T12:15:00+08:00",
    period: "午",
  });
  assert.equal(result.标题.title[0].text.content, "标题");
  assert.equal(result.时段.select.name, "午");
  assert.deepEqual(result.标签.multi_select, [{ name: "生活" }]);
});

test("读取 Notion 页面供周回顾使用", () => {
  const result = reflectionFromPage({ properties: {
    标题: { title: [{ plain_text: "我的想法" }] },
    内容: { rich_text: [{ plain_text: "正文" }] },
    标签: { multi_select: [{ name: "灵感" }] },
  } });
  assert.deepEqual(result, { title: "我的想法", content: "正文", tags: ["灵感"] });
});

test("周回顾字段映射与现有数据库一致", () => {
  const result = weeklyProperties({
    title: "本周",
    dateRange: "7/12-7/18",
    body: "正文",
    themes: ["生活"],
    generatedDate: "2026-07-18",
    count: 3,
  });
  assert.equal(result.记录条数.number, 3);
  assert.equal(result.本周主题.multi_select[0].name, "生活");
});

test("缺少 Secret 时给出明确错误", () => {
  assert.throws(() => loadConfig("capture", {}), /DEEPSEEK_API_KEY.*NOTION_TOKEN.*NOTION_DAILY_DATABASE_ID/);
});

test("Notion database ID 会自动解析为唯一 data source ID", async () => {
  const notion = new NotionClient({ token: "test" });
  notion.request = async (path) => {
    assert.equal(path, "/databases/database-id");
    return { data_sources: [{ id: "data-source-id", name: "每日感悟" }] };
  };
  assert.equal(await notion.resolveDataSourceId("database-id"), "data-source-id");
  assert.equal(await notion.resolveDataSourceId("database-id"), "data-source-id");
});

test("多 data source 数据库拒绝猜测目标", async () => {
  const notion = new NotionClient({ token: "test" });
  notion.request = async () => ({ data_sources: [{ id: "one" }, { id: "two" }] });
  await assert.rejects(() => notion.resolveDataSourceId("database-id"), /包含 2 个数据源/);
});
