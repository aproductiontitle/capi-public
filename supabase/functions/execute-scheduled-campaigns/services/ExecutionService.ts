import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Campaign } from '../types.ts';
import { ValidationService } from './ValidationService.ts';
import { ContactProcessor } from './ContactProcessor.ts';
import { CampaignMonitor } from './CampaignMonitor.ts';

export class ExecutionService {
  private supabase;
  private validationService: ValidationService;
  private contactProcessor: ContactProcessor;
  private monitor: CampaignMonitor;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.validationService = new ValidationService(supabaseUrl, supabaseKey);
    this.contactProcessor = new ContactProcessor(supabaseUrl, supabaseKey);
    this.monitor = new CampaignMonitor(supabaseUrl, supabaseKey);
  }

  async executeCampaign(campaign: Campaign): Promise<void> {
    const correlationId = crypto.randomUUID();
    console.log(`[${correlationId}] Starting execution for campaign ${campaign.id}`, {
      campaignName: campaign.name,
      status: campaign.status,
      timestamp: new Date().toISOString()
    });

    try {
      // Validate campaign with retries
      const validation = await this.validateWithRetry(campaign);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.error}`);
      }

      // Acquire execution lock with retry mechanism
      const lock = await this.acquireExecutionLock(campaign.id, correlationId);
      if (!lock.acquired) {
        throw new Error(`Failed to acquire execution lock: ${lock.reason}`);
      }

      console.log(`[${correlationId}] Acquired execution lock for campaign ${campaign.id}`);

      // Process contacts in batches
      const contacts = await this.prepareContactBatch(campaign.id);
      console.log(`[${correlationId}] Prepared ${contacts.length} contacts for processing`);

      for (const contact of contacts) {
        try {
          await this.contactProcessor.processContact(
            contact,
            campaign.id,
            validation.details?.vapiKey,
            validation.details?.assistantId,
            correlationId
          );
        } catch (error) {
          console.error(`[${correlationId}] Error processing contact ${contact.id}:`, error);
          await this.monitor.logExecutionAttempt(campaign.id, {
            status: 'failed',
            correlationId,
            error: error.message,
            details: {
              contactId: contact.id,
              errorType: error.name,
              timestamp: new Date().toISOString()
            }
          });
        }
      }

      // Log successful execution
      await this.monitor.logExecutionAttempt(campaign.id, {
        status: 'completed',
        correlationId,
        details: {
          processedContacts: contacts.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error(`[${correlationId}] Campaign execution error:`, {
        campaignId: campaign.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      // Update campaign status and log error
      await this.handleExecutionError(campaign.id, error, correlationId);
      throw error;
    } finally {
      // Release execution lock
      await this.releaseExecutionLock(campaign.id, correlationId);
    }
  }

  private async validateWithRetry(campaign: Campaign, attempts = 0): Promise<any> {
    try {
      return await this.validationService.validateCampaignConfig(campaign);
    } catch (error) {
      if (attempts < this.MAX_RETRIES) {
        console.log(`Validation attempt ${attempts + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.validateWithRetry(campaign, attempts + 1);
      }
      throw error;
    }
  }

  private async acquireExecutionLock(campaignId: string, correlationId: string, attempts = 0): Promise<{ acquired: boolean; reason?: string }> {
    try {
      const { data: lockResult } = await this.supabase.rpc('acquire_campaign_execution_lock', {
        p_campaign_id: campaignId,
        p_lock_id: correlationId
      });

      if (lockResult?.[0]?.lock_acquired) {
        return { acquired: true };
      }

      if (attempts < this.MAX_RETRIES) {
        console.log(`Lock acquisition attempt ${attempts + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.acquireExecutionLock(campaignId, correlationId, attempts + 1);
      }

      return { 
        acquired: false, 
        reason: 'Max retry attempts reached for lock acquisition' 
      };
    } catch (error) {
      console.error('Error acquiring execution lock:', error);
      return { 
        acquired: false, 
        reason: error.message 
      };
    }
  }

  private async releaseExecutionLock(campaignId: string, correlationId: string): Promise<void> {
    try {
      await this.supabase
        .from('campaigns')
        .update({
          execution_lock_id: null,
          execution_lock_time: null
        })
        .eq('id', campaignId)
        .eq('execution_lock_id', correlationId);
    } catch (error) {
      console.error('Error releasing execution lock:', error);
    }
  }

  private async prepareContactBatch(campaignId: string): Promise<any[]> {
    const { data: contacts, error } = await this.supabase.rpc('prepare_campaign_batch', {
      p_campaign_id: campaignId,
      batch_size: 5
    });

    if (error) throw error;
    return contacts || [];
  }

  private async handleExecutionError(campaignId: string, error: Error, correlationId: string): Promise<void> {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    // Log error to campaign execution metrics
    await this.monitor.logExecutionAttempt(campaignId, {
      status: 'failed',
      correlationId,
      error: error.message,
      details: errorDetails
    });

    // Update campaign status
    await this.supabase
      .from('campaigns')
      .update({
        status: 'failed',
        execution_error: error.message,
        last_execution_attempt: new Date().toISOString()
      })
      .eq('id', campaignId);

    // Log to audit trail
    await this.supabase
      .from('audit_logs')
      .insert({
        action: 'campaign_execution_failed',
        details: {
          campaignId,
          correlationId,
          error: errorDetails
        }
      });
  }
}