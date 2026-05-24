export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.knup.site/api/v1',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://api.knup.site/ws',
} as const;
