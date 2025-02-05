import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCampaignExecution } from '../hooks/useCampaignExecution';
import { createMockSupabaseClient } from './utils/mockSupabase';
import { vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

describe('Campaign Execution', () => {
  const mockCampaignId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation & Deployment', () => {
    it('should handle validation failure', async () => {
      const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
      
      const mockResponse = {
        data: [{ is_valid: false, validation_details: { message: 'Invalid config' } }],
        error: null
      };

      vi.spyOn(createMockSupabaseClient(), 'rpc').mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await result.current.validateCampaign();
      });

      expect(result.current.healthMetrics?.latest_contact_error).toBeDefined();
    });

    it('should acquire execution lock successfully', async () => {
      const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
      
      const mockResponse = {
        data: [{ lock_acquired: true, batch_id: 'batch-123' }],
        error: null
      };

      vi.spyOn(createMockSupabaseClient(), 'rpc').mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await result.current.deployMutation.mutateAsync();
      });

      expect(createMockSupabaseClient().rpc).toHaveBeenCalledWith(
        'acquire_campaign_execution_lock',
        expect.any(Object)
      );
    });

    it('should track validation status changes', async () => {
      const { result } = renderHook(() => useCampaignExecution(mockCampaignId));
      
      const mockValidationResponse = {
        data: [{ 
          is_valid: true, 
          validation_details: {
            timestamp: new Date().toISOString(),
            checks: ['api_key_valid', 'assistant_configured']
          }
        }],
        error: null
      };

      vi.spyOn(createMockSupabaseClient(), 'rpc')
        .mockResolvedValueOnce(mockValidationResponse);

      await act(async () => {
        await result.current.validateCampaign();
      });

      expect(result.current.healthMetrics?.vapi_config_validated).toBe(true);
      expect(result.current.healthMetrics?.last_validation_time).toBeDefined();
    });
  });
});