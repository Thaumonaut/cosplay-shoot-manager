import { Calendar, Camera, LayoutGrid, Users, Wrench, MapPin, Package, Shirt, Map, TestTube } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { TeamSwitcher } from "./TeamSwitcher";
// import { ThemeToggle } from "./ThemeToggle";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutGrid,
    testId: "link-navigation-dashboard",
  },
  {
    title: "All Shoots",
    url: "/shoots",
    icon: Camera,
    testId: "link-navigation-all-shoots",
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
    testId: "link-navigation-calendar",
  },
  {
    title: "Map View",
    url: "/map",
    icon: Map,
    testId: "link-navigation-map",
  },
];

const resourceItems = [
  {
    title: "Crew",
    url: "/personnel",
    icon: Users,
    testId: "link-resource-personnel",
  },
  {
    title: "Equipment",
    url: "/equipment",
    icon: Wrench,
    testId: "link-resource-equipment",
  },
  {
    title: "Locations",
    url: "/locations",
    icon: MapPin,
    testId: "link-resource-locations",
  },
  {
    title: "Costumes",
    url: "/costumes",
    icon: Shirt,
    testId: "link-resource-costumes",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getInitials = (email: string) => {
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const getUserName = (email: string) => {
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/);
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">CosPlans</h2>
            <p className="text-xs text-muted-foreground">Photo Shoot Manager</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Team</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* <TeamSwitcher /> */}
            <div className="p-2">
              <h2 className="text-sm font-semibold text-sidebar-foreground">Test Team</h2>
              <p className="text-xs text-sidebar-muted-foreground">Development Mode</p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="hover-elevate">
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="hover-elevate">
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Development Section - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <SidebarGroup>
            <SidebarGroupLabel>Development</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/dev-test'} className="hover-elevate">
                    <Link href="/dev-test">
                      <TestTube className="h-4 w-4" />
                      <span>Test Suite</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-6 pt-4">
        {/* <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div> */}
        <Link href="/profile" data-testid="link-profile">
          <div className="flex items-center gap-3 rounded-lg p-2 -m-2 hover-elevate cursor-pointer">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.email ? getInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium" data-testid="text-user-name">
                {user?.email ? getUserName(user.email) : 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
