import { requestJson } from "./http.mjs";

function plainText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(plainText).filter(Boolean).join("");
  return value.plain_text || value.text?.content || value.name || "";
}

export function richText(content) {
  const value = String(content || "");
  const chunks = value.match(/[\s\S]{1,2000}/g) || [];
  return chunks.slice(0, 100).map((text) => ({ type: "text", text: { content: text } }));
}

export function captureProperties(record) {
  return {
    标题: { title: richText(record.title) },
    原话: { rich_text: richText(record.raw) },
    内容: { rich_text: richText(record.polished) },
    摘要: { rich_text: richText(record.summary) },
    标签: { multi_select: record.tags.map((name) => ({ name })) },
    日期: { date: { start: record.date } },
    时段: { select: { name: record.period } },
  };
}

export function weeklyProperties(review) {
  return {
    标题: { title: richText(review.title) },
    日期范围: { rich_text: richText(review.dateRange) },
    回顾正文: { rich_text: richText(review.body) },
    本周主题: { multi_select: review.themes.map((name) => ({ name })) },
    生成日期: { date: { start: review.generatedDate } },
    记录条数: { number: review.count },
  };
}

export function reflectionFromPage(page) {
  const p = page?.properties || {};
  return {
    title: plainText(p.标题?.title) || "无标题",
    content: plainText(p.内容?.rich_text) || plainText(p.摘要?.rich_text),
    tags: (p.标签?.multi_select || []).map((tag) => tag.name).filter(Boolean),
  };
}

export class NotionClient {
  constructor({ token, version = "2025-09-03" }) {
    this.token = token;
    this.version = version;
    this.baseUrl = "https://api.notion.com/v1";
    this.dataSources = new Map();
  }

  async request(path, options = {}) {
    return requestJson(
      `${this.baseUrl}${path}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Notion-Version": this.version,
          "Content-Type": "application/json",
          ...options.headers,
        },
      },
      { attempts: 3, timeoutMs: 45_000, label: "Notion" },
    );
  }

  async resolveDataSourceId(databaseOrDataSourceId) {
    if (this.dataSources.has(databaseOrDataSourceId)) return this.dataSources.get(databaseOrDataSourceId);
    try {
      const database = await this.request(`/databases/${databaseOrDataSourceId}`);
      const sources = database?.data_sources || [];
      if (sources.length !== 1) {
        throw new Error(`Notion 数据库包含 ${sources.length} 个数据源，请在 Secret 中填写目标 data_source_id`);
      }
      this.dataSources.set(databaseOrDataSourceId, sources[0].id);
      return sources[0].id;
    } catch (error) {
      if (!/HTTP 404/.test(error.message)) throw error;
      await this.request(`/data_sources/${databaseOrDataSourceId}`);
      this.dataSources.set(databaseOrDataSourceId, databaseOrDataSourceId);
      return databaseOrDataSourceId;
    }
  }

  async createPage(databaseOrDataSourceId, properties) {
    const dataSourceId = await this.resolveDataSourceId(databaseOrDataSourceId);
    return this.request("/pages", {
      method: "POST",
      body: JSON.stringify({ parent: { type: "data_source_id", data_source_id: dataSourceId }, properties }),
    });
  }

  async queryReflections(databaseOrDataSourceId, startDate) {
    const dataSourceId = await this.resolveDataSourceId(databaseOrDataSourceId);
    const results = [];
    let cursor;
    do {
      const body = {
        page_size: 100,
        filter: { property: "日期", date: { on_or_after: startDate } },
        sorts: [{ property: "日期", direction: "ascending" }],
      };
      if (cursor) body.start_cursor = cursor;
      const page = await this.request(`/data_sources/${dataSourceId}/query`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      results.push(...(page.results || []));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);
    return results.map(reflectionFromPage).filter((item) => item.content.trim());
  }
}
