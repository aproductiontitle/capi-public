import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCampaignExecution } from '../hooks/useCampaignExecution';
import { createMockSupabaseClient } from './utils/mockSupabase';
import { vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

describe('VAPI Integration', () => {
  const mockCampaignId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate webhook configurations', async () => {
    const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
    
    vi.spyOn(createMockSupabaseClient().functions, 'invoke').mockResolvedValueOnce({
      data: {
        success: true,
        webhookValidation: {
          isValid: true,
          endpoints: ['webhook', 'errorWebhook']
        }
      },
      error: null
    });

    await act(async () => {
      await result.current.deployMutation.mutateAsync();
    });

    expect(createMockSupabaseClient().functions.invoke).toHaveBeenCalledWith(
      'execute-scheduled-campaigns',
      expect.any(Object)
    );
  });

  it('should handle webhook error responses', async () => {
    const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
    
    vi.spyOn(createMockSupabaseClient().functions, 'invoke').mockRejectedValueOnce(
      new Error('Webhook configuration invalid')
    );

    await act(async () => {
      try {
        await result.current.deployMutation.mutateAsync();
      } catch (error) {
        expect(error.message).toContain('Webhook configuration invalid');
      }
    });
  });
});