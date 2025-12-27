
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, Shield, ShieldAlert, User, LogOut, BarChart, Home, Settings, List, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/common/ThemeToggle';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const { user, logout, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarProvider>
          <Sidebar className="h-full">
            <SidebarHeader className="p-4 flex items-center space-x-2">
              <Shield className="h-8 w-8 text-sidebar-primary" />
              <span className="text-xl font-bold ">AI Enhanced Penetration Testing</span>
            </SidebarHeader>
            
            <SidebarContent className="px-3 py-4">
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/scan"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <ShieldAlert className="h-5 w-5" />
                  <span>New Scan</span>
                </Link>
                
                <Link
                  to="/scan-history"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <List className="h-5 w-5" />
                  <span>Scan History</span>
                </Link>

                {isAdmin && (
                  <>
                    <div className="my-3 border-t border-sidebar-border"></div>
                    <div className="px-3 py-1 text-xs font-semibold text-sidebar-foreground opacity-70">
                      Admin
                    </div>
                    
                    <Link
                      to="/admin"
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <BarChart className="h-5 w-5" />
                      <span>Overview</span>
                    </Link>
                    
                    <Link
                      to="/admin/users"
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <User className="h-5 w-5" />
                      <span>Users</span>
                    </Link>
                    
                    <Link
                      to="/admin/scans"
                      className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <Eye className="h-5 w-5" />
                      <span>All Scans</span>
                    </Link>
                  </>
                )}
              </div>
            </SidebarContent>
            
            <SidebarFooter className="p-4 border-t border-sidebar-border">
              <div className="flex items-center justify-between">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                
                <div className="flex space-x-2">
                  <ThemeToggle />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={logout}
                    className="h-9 w-9"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:pl-64" : ""
      )}>
        <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
