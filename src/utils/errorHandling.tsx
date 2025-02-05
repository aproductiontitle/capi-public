import * as React from 'react';
import * as Sentry from "@sentry/react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AuditAction = Database['public']['Enums']['audit_action'];

// Initialize Sentry
const initSentry = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });

    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
      });
    }
  }
};

initSentry().catch(console.error);

export const logError = async (error: Error, context?: Record<string, any>) => {
  console.error('Error occurred:', error);
  console.error('Context:', context);

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'settings_change' as AuditAction,
        details: {
          error: error.message,
          stack: error.stack,
          context,
        },
      });
    }
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }

  return error;
};

export const logEvent = async (
  action: AuditAction,
  details: Record<string, any>,
  level: 'info' | 'warning' | 'error' = 'info'
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        details: {
          ...details,
          level,
        },
      });
    }
  } catch (error) {
    console.error('Failed to log event:', error);
  }
};

export const getErrorMessage = (error: Error | unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

const DefaultErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-4 border border-red-300 bg-red-50 rounded-md">
    <h3 className="text-lg font-semibold text-red-800">
      Something went wrong
    </h3>
    <p className="text-sm text-red-600">
      {getErrorMessage(error)}
    </p>
  </div>
);

type FallbackProps = {
  error: Error;
  resetErrorBoundary?: () => void;
};

export const createErrorBoundary = (
  Component: React.ComponentType<any>,
  options: { fallback?: React.ComponentType<FallbackProps> } = {}
) => {
  const FallbackComponent = options.fallback || DefaultErrorFallback;
  
  return Sentry.withErrorBoundary(Component, {
    fallback: (props) => <FallbackComponent {...props} />
  });
};