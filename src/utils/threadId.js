const THREAD_ID_PREFIX = "154";

export function generateThreadId() {
  return THREAD_ID_PREFIX + Math.random().toString(36).slice(2, 10);
}
