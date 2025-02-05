import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface AdminLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

export const AdminLink = ({ to, icon: Icon, label, isActive }: AdminLinkProps) => {
  return (
    <>
      <Button
        variant={isActive ? 'default' : 'ghost'}
        size="sm"
        className="hidden sm:inline-flex"
        asChild
      >
        <Link to={to}>
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Link>
      </Button>
      <Button
        variant={isActive ? 'default' : 'ghost'}
        size="sm"
        className="sm:hidden"
        asChild
      >
        <Link to={to}>
          <Icon className="w-4 h-4" />
        </Link>
      </Button>
    </>
  );
};