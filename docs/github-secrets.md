# GitHub Secrets 设置

> 请在你自己的**私有运行仓库**中完成以下设置，不要把真实凭证添加到本公共模板。

进入：`Settings → Secrets and variables → Actions → New repository secret`。

添加以下四项：

| Secret | 内容 |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `NOTION_TOKEN` | Notion Internal Integration Token |
| `NOTION_DAILY_DATABASE_ID` | 每日感悟数据库 ID；也可以填写对应 data source ID |
| `NOTION_WEEKLY_DATABASE_ID` | 每周回顾数据库 ID；也可以填写对应 data source ID |

注意：

- Notion Integration 必须被添加到两个数据库的 Connections；
- 如果一个 Notion 数据库包含多个 data source，请填写目标 `data_source_id`；
- 不要把 Secret 贴到 Issue、代码、提交信息、Actions 输入或聊天中；
- 配置完成后，先从 Actions 页面手动运行一次“记录语音感悟”。
