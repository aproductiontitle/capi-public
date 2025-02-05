import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Campaign, HealthMetrics, ExecutionDetails, ValidationDetail } from '../types';
import { CampaignValidationService } from '../services/CampaignValidationService';
import { CampaignError, CampaignErrorHandler } from '../services/CampaignErrorHandler';

export const useCampaignExecution = (campaignId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading: isCampaignLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      console.log('Fetching campaign data for ID:', campaignId);
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          assistant:assistants (
            id,
            name,
            vapi_assistant_id
          ),
          contacts:campaign_contacts (*)
        `)
        .eq('id', campaignId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Campaign not found');
      
      const validationDetails = Array.isArray(data.validation_details) 
        ? data.validation_details.map((detail: any): ValidationDetail => ({
            vapi_config_validated: Boolean(detail.vapi_config_validated),
            last_validation_error: detail.last_validation_error || null
          }))
        : [];

      const transformedData: Campaign = {
        ...data,
        validation_details: validationDetails
      };
      
      return transformedData;
    },
  });

  const { data: healthMetrics, isLoading: isHealthLoading } = useQuery({
    queryKey: ['campaign-health', campaignId],
    queryFn: async () => {
      const { data: metricsData, error } = await supabase
        .from('campaign_health_metrics')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (error) throw error;
      if (!metricsData) return null;

      const executionDetails = typeof metricsData.last_execution_details === 'string' 
        ? JSON.parse(metricsData.last_execution_details)
        : (metricsData.last_execution_details as ExecutionDetails || {});

      const metrics: HealthMetrics = {
        ...metricsData,
        last_execution_details: executionDetails,
        vapi_error_count: executionDetails?.vapi_errors || 0,
        consecutive_failures: metricsData.current_retry_count || 0,
        vapi_response_time_ms: executionDetails?.response_time_ms || 0,
        error_classification: executionDetails?.error_type || null,
        state_transition_history: executionDetails?.state_transitions || [],
        validation_steps_completed: executionDetails?.validation_steps || [],
        validation_stack_trace: metricsData.validation_stack_trace || null
      };

      return metrics;
    },
    refetchInterval: 5000,
  });

  const validateCampaign = async () => {
    try {
      if (!campaign) throw new Error('Campaign not found');
      
      const validationService = new CampaignValidationService(campaign);
      const validation = await validationService.validateConfiguration();
      
      if (!validation.isValid) {
        throw new CampaignError('CONFIGURATION', validation.error || 'Campaign validation failed');
      }
      
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-health', campaignId] });
      
      return validation;
    } catch (error) {
      console.error('Validation error:', error);
      const { error: classifiedError } = await CampaignErrorHandler.handleError(error, { campaignId });
      throw classifiedError;
    }
  };

  const deployMutation = useMutation({
    mutationFn: async () => {
      const correlationId = crypto.randomUUID();
      console.log(`[${correlationId}] Starting campaign deployment...`);

      try {
        if (!campaign) throw new Error('Campaign not found');

        // Clear any existing stale execution locks
        await supabase
          .from('campaigns')
          .update({
            execution_lock_id: null,
            execution_lock_time: null
          })
          .eq('id', campaignId)
          .lt('execution_lock_time', new Date(Date.now() - 5 * 60 * 1000).toISOString());

        // Validate campaign configuration
        const validationService = new CampaignValidationService(campaign);
        const validation = await validationService.validateConfiguration();
        
        if (!validation.isValid) {
          throw new CampaignError('CONFIGURATION', validation.error || 'Campaign validation failed');
        }

        // Get execution lock with retry mechanism
        let lockAcquired = false;
        let retryCount = 0;
        const maxRetries = 3;

        while (!lockAcquired && retryCount < maxRetries) {
          const { data: lockResult } = await supabase.rpc('acquire_campaign_execution_lock', {
            p_campaign_id: campaignId,
            p_lock_id: correlationId
          });

          if (lockResult?.[0]?.lock_acquired) {
            lockAcquired = true;
            break;
          }

          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

        if (!lockAcquired) {
          throw new CampaignError('RESOURCE', 'Failed to acquire campaign execution lock after retries');
        }

        // Execute campaign
        const response = await supabase.functions.invoke('execute-scheduled-campaigns', {
          body: { 
            campaignId,
            correlationId,
            userId: campaign.user_id
          }
        });

        if (!response.data?.success) {
          throw new CampaignError(
            'FATAL',
            response.data?.message || 'Failed to execute campaign'
          );
        }

        // Log successful execution
        await supabase.rpc('log_campaign_execution_attempt', {
          p_campaign_id: campaignId,
          p_status: 'completed',
          p_details: {
            correlationId,
            response: response.data,
            timestamp: new Date().toISOString()
          }
        });

        return response.data;

      } catch (error) {
        console.error(`[${correlationId}] Campaign execution error:`, error);
        
        const { error: classifiedError } = 
          await CampaignErrorHandler.handleError(error, { campaignId });

        // Release lock on error
        await supabase
          .from('campaigns')
          .update({
            execution_lock_id: null,
            execution_lock_time: null
          })
          .eq('id', campaignId)
          .eq('execution_lock_id', correlationId);

        // Log failure
        await supabase.rpc('log_campaign_execution_attempt', {
          p_campaign_id: campaignId,
          p_status: 'failed',
          p_details: {
            correlationId,
            error: classifiedError.message,
            timestamp: new Date().toISOString()
          }
        });
        
        throw classifiedError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign deployment initiated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-health', campaignId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    campaign,
    healthMetrics,
    isLoading: isCampaignLoading || isHealthLoading,
    deployMutation,
    validateCampaign,
  };
};
