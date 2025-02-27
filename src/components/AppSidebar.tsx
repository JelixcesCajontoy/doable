
import { MessageSquare, ListTodo, Users, UserCircle, FolderKanban, LogOut, UserRound } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useContext } from "react";
import { AuthContext } from "@/App";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles?: ('admin' | 'employee')[];
}

const items: MenuItem[] = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: UserRound,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ListTodo,
  },
  {
    title: "Messages",
    url: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    icon: Users,
  },
  {
    title: "Employees",
    url: "/dashboard/employees",
    icon: UserCircle,
    roles: ['admin'], // Only admins can see this
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log out",
      });
    }
  };

  const filteredItems = items.filter(item => 
    !item.roles || // Show items with no roles restriction
    (userRole && item.roles.includes(userRole)) // Show items where user has required role
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

