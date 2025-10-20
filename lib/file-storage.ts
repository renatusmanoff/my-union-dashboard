// In-memory file storage for Vercel production fallback
export const fileStorage = new Map<string, { data: Buffer; filename: string; type: string; size: number }>();
