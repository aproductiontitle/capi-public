import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCampaignExecution } from '../hooks/useCampaignExecution';
import { createMockSupabaseClient } from './utils/mockSupabase';
import { vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

describe('Campaign Validation and Execution', () => {
  const mockCampaignId = '123';
  const supabase = createMockSupabaseClient();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation Process', () => {
    it('should handle validation failure', async () => {
      const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
      
      const mockResponse = {
        data: [{ is_valid: false, validation_details: { message: 'Invalid config' } }],
        error: null
      };

      vi.spyOn(supabase, 'rpc').mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await result.current.deployMutation.mutateAsync();
      });

      expect(supabase.rpc).toHaveBeenCalledWith(
        'validate_vapi_configuration_detailed',
        expect.any(Object)
      );
    });

    it('should validate VAPI configuration', async () => {
      const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
      
      vi.spyOn(supabase.functions, 'invoke').mockResolvedValueOnce({
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

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'execute-scheduled-campaigns',
        expect.any(Object)
      );
    });
  });

  describe('Execution Process', () => {
    it('should acquire execution lock successfully', async () => {
      const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
      
      const mockResponse = {
        data: [{ lock_acquired: true, batch_id: 'batch-123' }],
        error: null
      };

      vi.spyOn(supabase, 'rpc').mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await result.current.deployMutation.mutateAsync();
      });

      expect(supabase.rpc).toHaveBeenCalledWith(
        'acquire_campaign_execution_lock',
        expect.any(Object)
      );
    });

    it('should handle lock timeout scenarios', async () => {
      const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
      
      const mockResponse = {
        data: [{ lock_acquired: false, cooldown_remaining: '5 minutes' }],
        error: null
      };

      vi.spyOn(supabase, 'rpc').mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await result.current.deployMutation.mutateAsync();
      });

      expect(supabase.rpc).toHaveBeenCalledWith(
        'acquire_campaign_execution_lock',
        expect.any(Object)
      );
    });
  });
});