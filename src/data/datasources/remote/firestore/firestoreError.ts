/** Lỗi do thiết bị mất mạng (khác với lỗi quyền / tài liệu không tồn tại) */
export function isConnectivityError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (!code) return true;
  return code === 'unavailable' || code === 'failed-precondition' || code === 'deadline-exceeded';
}
