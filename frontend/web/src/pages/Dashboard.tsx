
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getScanHistory, type ScanStatus } from '@/api-service/scan.service';
import { Shield, AlertTriangle, CheckCircle, Clock, ExternalLink, Loader2, TrendingUp, Activity } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

interface ScanItem {
  id: string;
  url: string;
  type: string;
  status: ScanStatus;
  date: string;
  vulnerabilities: number | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recentScans, setRecentScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentScans = async () => {
      try {
        const response = await getScanHistory();
        setRecentScans(response.data.slice(0, 4)); // Only show 4 most recent
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentScans();
  }, []);

  // Calculate stats
  const completedScans = recentScans.filter(scan => scan.status === 'completed').length;
  const vulnerabilitiesFound = recentScans.reduce((total, scan) =>
    total + (scan.vulnerabilities || 0), 0
  );
  const pendingScans = recentScans.filter(scan => scan.status === 'pending').length;

  const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    iconColor
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
  }) => (
    <Card className="overflow-hidden border-border/50 card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          </div>
          <div className={`h-14 w-14 rounded-xl ${gradient} flex items-center justify-center`}>
            <Icon className={`h-7 w-7 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>!
          </p>
        </div>
        <Link to="/scan">
          <Button size="lg" className="btn-scale shadow-md shadow-primary/20">
            <Shield className="mr-2 h-5 w-5" />
            New Scan
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Completed Scans"
          value={completedScans}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500/10 to-green-600/5"
          iconColor="text-green-600 dark:text-green-400"
        />

        <StatCard
          title="Vulnerabilities Found"
          value={vulnerabilitiesFound}
          icon={AlertTriangle}
          gradient="bg-gradient-to-br from-red-500/10 to-red-600/5"
          iconColor="text-red-600 dark:text-red-400"
        />

        <StatCard
          title="Pending Scans"
          value={pendingScans}
          icon={Clock}
          gradient="bg-gradient-to-br from-amber-500/10 to-amber-600/5"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Recent Scans */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-2xl">Recent Scans</CardTitle>
            <CardDescription className="mt-1.5">Your latest security scans and their results</CardDescription>
          </div>
          <Link to="/scan-history">
            <Button variant="outline" size="sm" className="gap-2">
              View all
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading scans...</p>
            </div>
          ) : recentScans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentScans.map((scan) => (
                <Card key={scan.id} className="overflow-hidden border-border/50 card-hover">
                  <CardHeader className="bg-muted/30 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{scan.url}</CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(scan.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <StatusBadge status={scan.status} className="flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Scan Type</p>
                        <p className="font-medium capitalize">{scan.type}</p>
                      </div>
                      {scan.status === 'completed' && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Vulnerabilities</p>
                          <p className={`text-2xl font-bold ${scan.vulnerabilities ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {scan.vulnerabilities || 0}
                          </p>
                        </div>
                      )}
                      <Link to={`/scan-result/${scan.id}`}>
                        <Button size="sm" variant="ghost" className="gap-1 hover:gap-2 transition-all">
                          Details
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Shield className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                You haven't run any scans yet. Start securing your applications now.
              </p>
              <Link to="/scan">
                <Button className="btn-scale">
                  <Shield className="mr-2 h-4 w-4" />
                  Start Your First Scan
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>Tips to get started with your security testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                Submit Your First Scan
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start by running a Basic scan on your web application to get a quick security assessment.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                Review Results
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Analyze your scan results and focus on high and medium severity findings first.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                Run a Full Scan
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once you've addressed initial findings, run a Full scan for comprehensive security testing.
              </p>
            </div>
            <Link to="/scan" className="block">
              <Button variant="outline" className="w-full mt-2">
                Start Your First Scan
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Security Resources
            </CardTitle>
            <CardDescription>Learn more about web application security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="https://owasp.org/www-project-top-ten/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors group"
            >
              <h3 className="font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                <ExternalLink className="h-4 w-4" />
                OWASP Top 10
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                A standard awareness document for developers and web application security.
              </p>
            </a>
            <a
              href="https://portswigger.net/web-security"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors group"
            >
              <h3 className="font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                <ExternalLink className="h-4 w-4" />
                Web Security Academy
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Free online training materials and labs covering web security vulnerabilities.
              </p>
            </a>
            <a
              href="https://securityheaders.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors group"
            >
              <h3 className="font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                <ExternalLink className="h-4 w-4" />
                Security Headers
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Learn about HTTP security headers and how they protect your web applications.
              </p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
