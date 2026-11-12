/** Chuyển mốc thời gian (ms) thành nhãn tương đối: "5m ago", "3h ago", "2d ago" */
export function formatRelativeTime(createdAtMs: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - createdAtMs);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
