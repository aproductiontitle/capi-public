import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Phone,
  Settings,
  Users,
  FileText,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  const items = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Assistants",
      icon: MessageSquare,
      href: "/assistants",
    },
    {
      title: "Campaigns",
      icon: Phone,
      href: "/campaigns",
    },
    {
      title: "Team",
      icon: Users,
      href: "/team",
    },
    {
      title: "Documentation",
      icon: FileText,
      href: "/documentation",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};