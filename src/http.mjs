const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requestJson(url, options = {}, settings = {}) {
  const {
    attempts = 3,
    timeoutMs = 45_000,
    label = "API 请求",
    fetchImpl = fetch,
  } = settings;

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
      });
      const bodyText = await response.text();
      let body = null;
      if (bodyText) {
        try {
          body = JSON.parse(bodyText);
        } catch {
          body = { message: bodyText.slice(0, 500) };
        }
      }

      if (response.ok) return body;

      const message = body?.message || body?.error?.message || `HTTP ${response.status}`;
      const error = new Error(`${label}失败（HTTP ${response.status}）：${message}`);
      error.status = response.status;
      if (!RETRYABLE_STATUS.has(response.status) || attempt === attempts) throw error;
      lastError = error;
    } catch (error) {
      lastError = error;
      if (attempt === attempts || (error.status && !RETRYABLE_STATUS.has(error.status))) throw error;
    }
    await delay(500 * 2 ** (attempt - 1));
  }
  throw lastError;
}
