# iOS 快捷指令设置

以下配置中的 `YOUR_USERNAME` 和 `YOUR_PRIVATE_REPO` 必须替换成你自己的 GitHub 用户名和私有运行仓库名。

## 推荐：Workflow Dispatch

### 1. 创建手机专用 Token

打开 GitHub：`Settings → Developer settings → Personal access tokens → Fine-grained tokens`。

- Repository access：只选择你的私有运行仓库；
- Repository permissions → Actions：Read and write；
- 设置合理的过期时间；
- 其他权限保持 No access。

### 2. 创建快捷指令

依次添加：

1. “听写文本”；
2. “请求输入”，默认内容设为听写结果；
3. “文本”，内容设为“请求输入”的魔法变量；
4. “获取 URL 内容”。

第 4 步设置：

- URL：`https://api.github.com/repos/YOUR_USERNAME/YOUR_PRIVATE_REPO/actions/workflows/capture.yml/dispatches`
- 方法：POST
- 请求体：JSON

请求头：

| 名称 | 值 |
|---|---|
| `Authorization` | `Bearer 你的Token` |
| `Accept` | `application/vnd.github+json` |
| `X-GitHub-Api-Version` | `2026-03-10` |
| `User-Agent` | `VoiceReflectionShortcut/1.0` |
| `Content-Type` | `application/json` |

> `Bearer` 与 Token 之间只能有一个英文空格，Token 前后不要包含空格或换行。

JSON 字段：

| 键 | 值 | 类型 |
|---|---|---|
| `ref` | `main` | 文本 |
| `inputs` | 字典 | 字典 |

`inputs` 字典内：

| 键 | 值 | 类型 |
|---|---|---|
| `text` | 第 3 步“文本”的魔法变量 | 文本 |

成功时 GitHub 返回 HTTP 200，以及 `workflow_run_id`、`run_url` 和 `html_url`。

## 兼容：Repository Dispatch

旧快捷指令可以使用：

- URL：`https://api.github.com/repos/YOUR_USERNAME/YOUR_PRIVATE_REPO/dispatches`
- Token 权限：Contents → Read and write
- `event_type`：`voice_reflection`
- `client_payload.text`：要提交的纯文本

该接口成功时返回 HTTP 204，没有响应体；快捷指令显示 `dispatches · 0 KB` 是正常现象。

## 建议的完成提示

在请求后添加“显示通知”：

```text
感悟已提交，正在后台整理
```
