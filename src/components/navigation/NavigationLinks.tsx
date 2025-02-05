import { Settings, Home, Bot, Phone, Users, FileText, Contact, BookOpen } from 'lucide-react';
import { NavigationLink } from './NavigationLink';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';

export const NavigationLinks = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/assistants', icon: Bot, label: 'Assistants' },
    { to: '/campaigns', icon: Phone, label: 'Campaigns' },
    { to: '/contacts', icon: Contact, label: 'Contacts' },
    { to: '/teams', icon: Users, label: 'Teams' },
    { to: '/knowledge', icon: BookOpen, label: 'Knowledge' },
    { to: '/documentation', icon: FileText, label: 'Docs' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex items-center space-x-4">
      <img 
        src={theme === 'dark' 
          ? '/lovable-uploads/cae941e0-8a77-4683-a5a6-cdb960b30e15.png'
          : '/lovable-uploads/3a5688f0-2529-42e4-9e63-a64f173e856a.png'
        }
        alt="Logo"
        className="h-8 w-auto mr-4"
      />
      <div className="flex items-center space-x-1 sm:space-x-2">
        {links.map((link) => (
          <NavigationLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            isActive={location.pathname === link.to}
          />
        ))}
      </div>
    </div>
  );
};