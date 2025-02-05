import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MembersList } from '../MembersList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import '../../../test/setup';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      url: new URL('https://example.com'),
      headers: {},
      insert: vi.fn(),
      upsert: vi.fn(),
      order: vi.fn(),
    }),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('MembersList', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockTeamMembers = [
    {
      id: '1',
      role: 'admin',
      user_id: 'user1',
      profiles: {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
      },
    },
    {
      id: '2',
      role: 'viewer',
      user_id: 'user2',
      profiles: {
        first_name: 'Viewer',
        last_name: 'User',
        email: 'viewer@example.com',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful data fetch
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockTeamMembers, error: null }),
      url: new URL('https://example.com'),
      headers: {},
      insert: vi.fn(),
      upsert: vi.fn(),
      order: vi.fn(),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MembersList teamId="test-team-id" />
      </QueryClientProvider>
    );
  };

  it('renders the members list correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Viewer User')).toBeInTheDocument();
    });
  });

  it('handles role update successfully', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
      url: new URL('https://example.com'),
      headers: {},
      select: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
      order: vi.fn(),
    });

    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
      update: mockUpdate,
      delete: vi.fn(),
      url: new URL('https://example.com'),
      headers: {},
      insert: vi.fn(),
      upsert: vi.fn(),
      order: vi.fn(),
    }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    // Simulate role update
    const roleSelect = screen.getAllByRole('combobox')[0];
    fireEvent.click(roleSelect);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Member role updated successfully');
    });
  });

  it('handles member removal successfully', async () => {
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
      url: new URL('https://example.com'),
      headers: {},
      select: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
      order: vi.fn(),
    });

    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
      update: vi.fn(),
      delete: mockDelete,
      url: new URL('https://example.com'),
      headers: {},
      insert: vi.fn(),
      upsert: vi.fn(),
      order: vi.fn(),
    }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    // Click remove button and confirm
    const removeButton = screen.getAllByRole('button', { name: /remove/i })[0];
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Member removed successfully');
    });
  });

  it('handles error states gracefully', async () => {
    const mockError = new Error('Failed to fetch members');
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      url: new URL('https://example.com'),
      headers: {},
      insert: vi.fn(),
      upsert: vi.fn(),
      order: vi.fn(),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No team members found. Use the invite form below to add members.')).toBeInTheDocument();
    });
  });
});