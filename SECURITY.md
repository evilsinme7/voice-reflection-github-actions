# Security

## Recommended deployment

Use this public repository as a template and run the workflow from a private repository. Personal reflections may be sensitive even when credentials are correctly stored.

## Secrets

- Store DeepSeek and Notion credentials only in GitHub Actions Secrets.
- Use a fine-grained GitHub PAT scoped to one private repository.
- Prefer Workflow Dispatch with Actions write permission; Repository Dispatch requires the broader Contents write permission.
- Never paste credentials into Issues, workflow inputs, logs, commits, screenshots, or chat messages.
- Rotate the iPhone PAT before it expires or immediately after suspected exposure.

## Logs

The project intentionally logs only counts and completion state. Do not add raw reflections, generated titles, Notion URLs, or API response bodies to public logs.

## Reporting a vulnerability

Please use GitHub private vulnerability reporting when available. Do not open a public issue containing credentials or private content.
