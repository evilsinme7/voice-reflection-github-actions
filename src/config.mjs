const REQUIRED = {
  capture: ["DEEPSEEK_API_KEY", "NOTION_TOKEN", "NOTION_DAILY_DATABASE_ID"],
  weekly: [
    "DEEPSEEK_API_KEY",
    "NOTION_TOKEN",
    "NOTION_DAILY_DATABASE_ID",
    "NOTION_WEEKLY_DATABASE_ID",
  ],
};

export function loadConfig(mode, env = process.env) {
  const missing = REQUIRED[mode].filter((name) => !env[name]?.trim());
  if (missing.length) {
    throw new Error(`缺少必要配置：${missing.join(", ")}`);
  }

  return {
    deepseekApiKey: env.DEEPSEEK_API_KEY.trim(),
    deepseekBaseUrl: (env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, ""),
    captureModel: env.DEEPSEEK_CAPTURE_MODEL || "deepseek-v4-flash",
    weeklyModel: env.DEEPSEEK_WEEKLY_MODEL || "deepseek-v4-pro",
    notionToken: env.NOTION_TOKEN.trim(),
    notionApiVersion: env.NOTION_API_VERSION || "2025-09-03",
    dailyDatabaseId: env.NOTION_DAILY_DATABASE_ID.trim(),
    weeklyDatabaseId: env.NOTION_WEEKLY_DATABASE_ID?.trim(),
    timezone: env.APP_TIMEZONE || "Asia/Shanghai",
  };
}
