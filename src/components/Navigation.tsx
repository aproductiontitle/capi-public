import { useLocation } from 'react-router-dom';
import { NavigationLinks } from './navigation/NavigationLinks';
import { LogoutButton } from './navigation/LogoutButton';
import { useAuthListener } from '@/hooks/useAuthListener';
import { ThemeToggle } from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();
  useAuthListener();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <NavigationLinks />
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;