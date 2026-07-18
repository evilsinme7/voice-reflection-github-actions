# 从 n8n v1 迁移到 GitHub Actions v2

原始版本位于 [voice-reflection-n8n](https://github.com/evilsinme7/voice-reflection-n8n)。v2 保留了同一套产品逻辑：iPhone 听写、DeepSeek 润色、Notion 归档与每周回顾，只替换了编排层。

## 迁移原因

- 不再依赖常驻 n8n / Railway 服务；
- 避免服务休眠或 Webhook 超时；
- 用版本控制保存全部处理逻辑；
- 用自动测试保护字段映射、日期计算和 JSON 解析；
- 凭证统一放在 GitHub Actions Secrets；
- 调度、重试和运行记录集中在 GitHub Actions。

## 对应关系

| n8n 节点 | GitHub Actions v2 |
|---|---|
| Webhook | `workflow_dispatch` / `repository_dispatch` |
| Code：整理字段 | `src/input.mjs` + `src/time.mjs` |
| DeepSeek 节点 | `src/deepseek.mjs` |
| Notion 节点 | `src/notion.mjs` |
| Schedule Trigger | `weekly-review.yml` |
| n8n Execution | GitHub Actions Run |

## 迁移注意事项

1. 不要复制 n8n Credential；在 GitHub 中重新创建 Secrets。
2. iOS 快捷指令需要从 Railway/n8n Webhook 改为 GitHub API URL。
3. 推荐重新创建“获取 URL 内容”动作，避免旧动作保留无效 Header 或空格。
4. 先手动运行一次日常记录，再启用每周定时任务。
5. 真实运行仓库应保持私有；公开仓库只用于展示和分发模板。
