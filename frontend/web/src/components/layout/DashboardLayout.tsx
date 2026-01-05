
import React, { useState } from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, Shield, ShieldAlert, User, LogOut, BarChart, Home, List, Eye, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/common/ThemeToggle';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Drawer } from 'antd';

export default function DashboardLayout() {
  const { user, logout, isAdmin, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }
  const storedtheme = theme === 'dark' ? 'dark' : 'light';

  const pageTitle = (() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/scan') return 'New Scan';
    if (path === '/scan-history') return 'Scan History';
    if (path.startsWith('/scan-result/')) return 'Scan Result';
    if (path === '/profile') return 'Profile';
    if (path === '/admin') return 'Admin Overview';
    if (path === '/admin/users') return 'Users';
    if (path.startsWith('/admin/users/')) return 'User Details';
    if (path === '/admin/scans') return 'All Scans';
    if (path.startsWith('/admin/scans/')) return 'Scan Details';
    if (path === '/admin/tools') return 'Scanning Tools';
    if (path === '/admin/settings') return 'Settings';
    return 'App';
  })();

  const breadcrumbs = (() => {
    const path = location.pathname;

    if (path === '/dashboard') return [{ label: 'Dashboard' }];
    if (path === '/scan') return [{ label: 'Scan' }];
    if (path === '/scan-history') {
      return [{ label: 'Scan', to: '/scan' }, { label: 'Scan History' }];
    }
    if (path.startsWith('/scan-result/')) {
      return [{ label: 'Scan', to: '/scan' }, { label: 'Scan Result' }];
    }
    if (path === '/profile') return [{ label: 'Profile' }];

    if (path === '/admin') return [{ label: 'Admin' }];
    if (path === '/admin/users') return [{ label: 'Admin', to: '/admin' }, { label: 'Users' }];
    if (path.startsWith('/admin/users/')) return [{ label: 'Admin', to: '/admin' }, { label: 'Users', to: '/admin/users' }, { label: 'User Details' }];
    if (path === '/admin/scans') return [{ label: 'Admin', to: '/admin' }, { label: 'All Scans' }];
    if (path.startsWith('/admin/scans/')) return [{ label: 'Admin', to: '/admin' }, { label: 'All Scans', to: '/admin/scans' }, { label: 'Scan Details' }];
    if (path === '/admin/tools') return [{ label: 'Admin', to: '/admin' }, { label: 'Scanning Tools' }];
    if (path === '/admin/settings') return [{ label: 'Admin', to: '/admin' }, { label: 'Settings' }];

    return [{ label: pageTitle }];
  })();

  const handleBack = () => {
    const path = location.pathname;

    // UX requirement: from Profile always go home/dashboard.
    if (path === '/profile') {
      navigate('/dashboard');
      return;
    }

    // Prefer browser back if there is history; otherwise fall back.
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/dashboard');
  };

  const sidebarLinkBase =
    "flex items-center space-x-3 rounded-md px-4 py-2.5 text-[15px] font-medium transition-colors";
  const sidebarLinkActive = "text-white bg-sidebar-accent ";
  const sidebarLinkInactive = "text-sidebar-foreground hover:bg-sidebar-accent";

  const appTitle = "AI Enhanced Penetration Testing";

  const Logo = (
    <img
      src="/favicon.ico"
      alt="Site logo"
      className="h-7 w-7"
    />
  );

  const Branding = (
    <div className="flex items-center gap-2 min-w-0">
      {Logo}
      <span className="text-base font-bold truncate">{appTitle}</span>
    </div>
  );

  const SidebarBody = (
    <>
      <SidebarContent className="px-3 py-4">
        <div className="space-y-1">
          <NavLink
            to="/dashboard"
            end
            onClick={() => setMobileDrawerOpen(false)}
            className={({ isActive }) =>
              cn(sidebarLinkBase, isActive ? sidebarLinkActive : sidebarLinkInactive)
            }
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/scan"
            end
            onClick={() => setMobileDrawerOpen(false)}
            className={({ isActive }) =>
              cn(sidebarLinkBase, isActive ? sidebarLinkActive : sidebarLinkInactive)
            }
          >
            <ShieldAlert className="h-5 w-5" />
            <span>New Scan</span>
          </NavLink>

          <NavLink
            to="/scan-history"
            end
            onClick={() => setMobileDrawerOpen(false)}
            className={({ isActive }) =>
              cn(sidebarLinkBase, isActive ? sidebarLinkActive : sidebarLinkInactive)
            }
          >
            <List className="h-5 w-5" />
            <span>Scan History</span>
          </NavLink>

          {isAdmin && (
            <>
              <div className="my-3 border-t border-sidebar-border"></div>
              <div className="px-3 py-1 text-xs font-semibold text-sidebar-foreground opacity-70">
                Admin
              </div>

              <NavLink
                to="/admin"
                end
                onClick={() => setMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(sidebarLinkBase, isActive ? sidebarLinkActive : sidebarLinkInactive)
                }
              >
                <BarChart className="h-5 w-5" />
                <span>Overview</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                end
                onClick={() => setMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(sidebarLinkBase, isActive ? sidebarLinkActive : sidebarLinkInactive)
                }
              >
                <User className="h-5 w-5" />
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/admin/scans"
                end
                onClick={() => setMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(sidebarLinkBase, isActive ? sidebarLinkActive : sidebarLinkInactive)
                }
              >
                <Eye className="h-5 w-5" />
                <span>All Scans</span>
              </NavLink>

              <NavLink
                to="/admin/tools"
                end
                onClick={() => setMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(sidebarLinkBase, isActive ? sidebarLinkActive : sidebarLinkInactive)
                }
              >
                <Shield className="h-5 w-5" />
                <span>Scanning Tools</span>
              </NavLink>
            </>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <Link
            to="/profile"
            onClick={() => setMobileDrawerOpen(false)}
            className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={logout}
            className={`h-9 w-9 ${storedtheme === 'dark' ? 'text-white' : 'text-black'}`}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );

  const SidebarPanel = (
    <div className="h-full w-full min-h-0 bg-sidebar text-sidebar-foreground flex flex-col">
      {SidebarBody}
    </div>
  );

  const DesktopSidebarPanel = (
    <div className="h-full w-full min-h-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <SidebarHeader className="h-20 px-4 flex items-center justify-center">
        <img
          src="/favicon.ico"
          alt="Site logo"
          className="h-12 w-12"
        />
      </SidebarHeader>
      {SidebarBody}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Drawer sidebar */}
      <div className="lg:hidden">
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          placement="left"
          width={300}
          closable={false}
          title={null}
          styles={{
            body: {
              padding: 0,
              height: '100%',
              overflow: 'hidden',
              background: 'hsl(var(--sidebar-background))',
              color: 'hsl(var(--sidebar-foreground))',
            },
          }}
        >
          <div className="h-full min-h-0 flex flex-col bg-sidebar text-sidebar-foreground">
            <div className="h-20 flex items-center gap-3 px-4 border-b border-sidebar-border">
              {Branding}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileDrawerOpen(false)}
                className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 min-h-0">
              {SidebarPanel}
            </div>
          </div>
        </Drawer>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
        {DesktopSidebarPanel}
      </div>

      {/* Main area */}
      <div className={cn(
        "flex-1 min-w-0 flex flex-col",
        "lg:pl-64"
      )}>
        {/* Top navbar */}
        <header className="sticky top-0 z-20 border-b bg-background/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile navbar: show branding when drawer closed, show only page title when drawer open */}
            <div className="lg:hidden flex items-center min-w-0">
              {mobileDrawerOpen ? (
                <span className="text-base font-semibold truncate">{pageTitle}</span>
              ) : (
                Branding
              )}
            </div>

            {/* Desktop navbar: show app title */}
            <div className="hidden lg:flex items-center min-w-0">
              <span className="text-lg font-semibold truncate">{appTitle}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon"
                onClick={logout}
                className={storedtheme === 'dark' ? 'text-white' : 'text-black'}
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={`${crumb.label}-${index}`}>
                      {index > 0 && <span aria-hidden="true">→</span>}

                      {crumb.to && !isLast ? (
                        <NavLink
                          to={crumb.to}
                          className="hover:text-foreground transition-colors"
                        >
                          {crumb.label}
                        </NavLink>
                      ) : (
                        <span className={isLast ? 'text-foreground font-medium' : undefined}>
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </nav>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
