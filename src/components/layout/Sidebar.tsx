import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderOpen,
  CheckCircle,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Settings,
  Menu,
  X,
  Building2
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "All Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Add Client",
    href: "/add-client",
    icon: UserPlus,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    name: "Delivered",
    href: "/delivered",
    icon: CheckCircle,
  },
  {
    name: "Earnings",
    href: "/earnings",
    icon: DollarSign,
  },
  {
    name: "Communications",
    href: "/communications",
    icon: MessageSquare,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        "glass border-r border-border/50 h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-accent" />
            <div>
              <h1 className="text-xl font-bold gradient-text">aXtr Labs</h1>
              <p className="text-xs text-muted-foreground">CRM System</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:bg-secondary/50"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  isActive 
                    ? "bg-gradient-button text-white shadow-lg hover:shadow-xl" 
                    : "hover:bg-secondary/50 hover:translate-x-1",
                  isCollapsed ? "px-2" : "px-4"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass rounded-lg p-3 border border-accent/20">
            <p className="text-xs text-center text-muted-foreground">
              Version 1.0.0
            </p>
            <p className="text-xs text-center text-accent font-medium">
              Powered by aXtr Labs
            </p>
          </div>
        </div>
      )}
    </div>
  );
}