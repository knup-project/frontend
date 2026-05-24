/**
 * Session QueryKey 팩토리
 */
export const sessionKeys = {
  all: ['sessions'] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (sessionId: string) => [...sessionKeys.details(), sessionId] as const,
} as const;
