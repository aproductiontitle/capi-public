import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Activity, History, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCampaignExecution } from "../hooks/useCampaignExecution";
import { format } from "date-fns";

interface CampaignHealthMetricsProps {
  campaignId: string;
}

export const CampaignHealthMetrics = ({ campaignId }: CampaignHealthMetricsProps) => {
  const { healthMetrics, isLoading, validateCampaign } = useCampaignExecution(campaignId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHealthStatus = () => {
    if (!healthMetrics) return 'unknown';
    
    if (healthMetrics.consecutive_failures >= 3 || healthMetrics.error_classification === 'vapi_error') {
      return 'critical';
    }
    
    if (healthMetrics.vapi_error_count > 0 || healthMetrics.error_classification === 'validation_error') {
      return 'warning';
    }
    
    return 'healthy';
  };

  const getCircuitBreakerStatus = () => {
    const status = healthMetrics?.circuit_breaker_status;
    if (!status) return null;

    return {
      isOpen: status.is_open,
      failureRate: (status.failure_rate * 100).toFixed(1),
      recoveryProgress: (status.recovery_progress * 100).toFixed(1),
      cooldownRemaining: status.cooldown_remaining
    };
  };

  const getStatusAlert = () => {
    const status = getHealthStatus();
    const circuitBreaker = getCircuitBreakerStatus();
    
    switch (status) {
      case 'critical':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical Issues Detected</AlertTitle>
            <AlertDescription>
              {healthMetrics?.error_classification === 'vapi_error' ? 
                'VAPI service errors detected. Please check your configuration.' :
                `Multiple consecutive failures (${healthMetrics?.consecutive_failures}) have triggered the circuit breaker.`
              }
              {circuitBreaker?.isOpen && (
                <div className="mt-2">
                  Circuit breaker is open. Cooldown remaining: {circuitBreaker.cooldownRemaining}
                </div>
              )}
              {healthMetrics?.latest_contact_error && (
                <div className="mt-2">
                  <strong>Latest Error:</strong> {healthMetrics.latest_contact_error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      case 'warning':
        return (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Performance Warning</AlertTitle>
            <AlertDescription>
              {healthMetrics?.error_classification === 'validation_error' ?
                'Campaign validation issues detected.' :
                `${healthMetrics?.vapi_error_count} VAPI errors detected.`
              }
              {healthMetrics?.latest_contact_error && (
                <div className="mt-2">
                  <strong>Latest Error:</strong> {healthMetrics.latest_contact_error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      case 'healthy':
        return (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>System Healthy</AlertTitle>
            <AlertDescription>
              All systems are operating normally.
              {healthMetrics?.vapi_response_time_ms && (
                <div className="mt-2">
                  Average response time: {healthMetrics.vapi_response_time_ms}ms
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Status Unknown</AlertTitle>
            <AlertDescription>
              Unable to determine system health status.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const calculateProgress = () => {
    if (!healthMetrics) return 0;
    const total = healthMetrics.total_contacts || 0;
    const completed = healthMetrics.completed_contacts || 0;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const circuitBreaker = getCircuitBreakerStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {getStatusAlert()}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact Status</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total Contacts:</div>
              <div>{healthMetrics?.total_contacts || 0}</div>
              <div>Completed:</div>
              <div>{healthMetrics?.completed_contacts || 0}</div>
              <div>Pending:</div>
              <div>{healthMetrics?.pending_contacts || 0}</div>
              <div>Failed:</div>
              <div>{healthMetrics?.failed_contacts || 0}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">System Health</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>VAPI Errors:</div>
              <div>{healthMetrics?.vapi_error_count || 0}</div>
              <div>Response Time:</div>
              <div>{healthMetrics?.vapi_response_time_ms ? `${healthMetrics.vapi_response_time_ms}ms` : 'N/A'}</div>
              <div>Consecutive Failures:</div>
              <div>{healthMetrics?.consecutive_failures || 0}</div>
              <div>Error Type:</div>
              <div>{healthMetrics?.error_classification || 'None'}</div>
            </div>
          </div>
        </div>

        {circuitBreaker && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Circuit Breaker Status</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div>Status:</div>
                <Badge variant={circuitBreaker.isOpen ? "destructive" : "default"}>
                  {circuitBreaker.isOpen ? 'Open' : 'Closed'}
                </Badge>
                <div>Failure Rate:</div>
                <div>{circuitBreaker.failureRate}%</div>
                <div>Recovery Progress:</div>
                <div>{circuitBreaker.recoveryProgress}%</div>
                {circuitBreaker.isOpen && (
                  <>
                    <div>Cooldown:</div>
                    <div>{circuitBreaker.cooldownRemaining}</div>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {healthMetrics?.state_transition_history && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent State Changes
            </h4>
            <div className="text-sm space-y-2">
              {(healthMetrics.state_transition_history as any[]).slice(-3).map((transition, idx) => (
                <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <span>{format(new Date(transition.timestamp), 'MMM d, HH:mm:ss')}</span>
                  <span>{transition.from || 'initial'} → {transition.to}</span>
                  {transition.reason && <span className="text-xs">({transition.reason})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};