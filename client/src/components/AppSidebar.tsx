import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Map,
    Target,
    Zap,
    Award,
    Globe,
    Briefcase,
    Layout,
    UserCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
    {
        title: "Platform",
        items: [
            { title: "Mission Control", url: "/dashboard/1", icon: LayoutDashboard }, // Default to ID 1 for now
            { title: "Market Pulse", url: "/market", icon: Briefcase },
            { title: "Career Quest", url: "/quest", icon: Award },
        ]
    },
    {
        title: "Tools",
        items: [
            { title: "Mock Interview", url: "/interview/new", icon: Zap },
            { title: "Portfolio Studio", url: "/portfolio", icon: Globe },
        ]
    }
];

export default function AppSidebar() {
    const [location] = useLocation();

    return (
        <Sidebar collapsible="icon" className="bg-[#1a1b41] text-white border-r border-[#2d2e5f] data-[collapsed=true]:w-[70px]">
            <SidebarHeader className="h-20 border-b border-[#2d2e5f] flex items-center justify-center px-4 bg-[#151635]">
                <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner shadow-indigo-500/20">
                        <Target className="w-6 h-6 text-indigo-300" />
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden font-display">Polaris</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-[#1a1b41] px-2 py-4">
                {navItems.map((group) => (
                    <SidebarGroup key={group.title} className="mb-6">
                        <SidebarGroupLabel className="text-indigo-300/60 text-xs font-bold uppercase tracking-widest px-4 mb-2">{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive = location.startsWith(item.url.split('/')[1] === 'dashboard' ? '/dashboard' : item.url);
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={item.title}
                                                className={`h-11 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                                    ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-900/50 hover:bg-indigo-600 font-medium"
                                                    : "text-indigo-100/70 hover:bg-white/5 hover:text-white"
                                                    }`}
                                            >
                                                <Link href={item.url} className="flex items-center gap-3 px-3">
                                                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-indigo-300/70 group-hover:text-white"}`} />
                                                    <span className="text-sm">{item.title}</span>
                                                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/20 rounded-l-full" />}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="bg-[#151635] border-t border-[#2d2e5f] p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Profile" className="h-auto py-2 hover:bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center ring-2 ring-[#2d2e5f]">
                                    <UserCircle className="w-6 h-6 text-white/90" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-sm text-white">Demo User</span>
                                    <span className="text-xs text-indigo-300/70">Pro Plan</span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail className="hover:after:bg-indigo-500" />
        </Sidebar>
    );
}
