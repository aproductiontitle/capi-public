import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InviteMemberForm } from '../InviteMemberForm';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
}));

describe('InviteMemberForm', () => {
  const mockTeamId = "test-team-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<InviteMemberForm teamId={mockTeamId} />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeInTheDocument();
  });

  it('invites a member successfully', async () => {
    render(<InviteMemberForm teamId={mockTeamId} />);
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(supabase.functions.invoke).toHaveBeenCalledWith('send-team-invitation', {
      body: { 
        teamId: mockTeamId,
        email: 'test@example.com',
        role: 'viewer'
      },
    });
  });

  it('shows an error message on failure', async () => {
    vi.mocked(supabase.functions.invoke).mockRejectedValueOnce(new Error('Failed to invite member'));

    render(<InviteMemberForm teamId={mockTeamId} />);
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(await screen.findByText(/failed to invite member/i)).toBeInTheDocument();
  });
});