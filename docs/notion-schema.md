# Notion 数据库结构

属性名称必须与下表一致。类型不匹配时，Notion API 会拒绝写入。

## 每日感悟

| 属性 | Notion 类型 | 用途 |
|---|---|---|
| 标题 | Title | AI 生成的一句话标题 |
| 原话 | Rich text | iPhone 听写原文 |
| 内容 | Rich text | 纠错和润色后的文本 |
| 摘要 | Rich text | 一至两句话摘要 |
| 标签 | Multi-select | 1 至 3 个主题标签 |
| 日期 | Date | 按目标时区生成的记录时间 |
| 时段 | Select | `早`、`午` 或 `晚` |

## 每周回顾

| 属性 | Notion 类型 | 用途 |
|---|---|---|
| 标题 | Title | 本周回顾标题 |
| 日期范围 | Rich text | 例如 `7/12-7/18` |
| 回顾正文 | Rich text | 结构化回顾内容 |
| 本周主题 | Multi-select | 本周主要主题 |
| 生成日期 | Date | 回顾生成日期 |
| 记录条数 | Number | 纳入分析的有效记录数 |

创建数据库后：

1. 创建 Notion Internal Integration；
2. 在两个数据库的 Connections 中添加该 Integration；
3. 将数据库 ID 或唯一的 data source ID 添加到 GitHub Secrets。
