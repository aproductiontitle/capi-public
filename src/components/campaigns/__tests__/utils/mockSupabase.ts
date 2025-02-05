import { vi } from 'vitest';

export const mockResponse = {
  data: null,
  error: null,
  count: null,
  status: 200,
  statusText: 'OK'
};

export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(mockResponse),
    maybeSingle: vi.fn().mockResolvedValue(mockResponse)
  })),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null })
  }
});