import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Teams from '@/pages/Teams';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../../test/setup';

describe('Teams Page', () => {
  const queryClient = new QueryClient();

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Teams />
      </QueryClientProvider>
    );
  };

  it('renders the teams page correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Team Management')).toBeInTheDocument();
    expect(screen.getByText('Invite Members')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  it('displays both the invite form and members list', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send invite/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});