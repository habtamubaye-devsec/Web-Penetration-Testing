import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Lock,
  Target,
  Scan,
  BarChart3,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 -z-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <img
                  src="/favicon.ico"
                  alt="Site logo"
                  width={96}
                  height={96}
                  className="h-20 w-20 md:h-24 md:w-24"
                />
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Advanced AI Enhanced Penetration Testing & Security Scanning
              </h1>
              <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Identify vulnerabilities before attackers do. Run fast scans, customize tools, and generate clear reports your team can act on.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Scanning Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Login to Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-card/60 border border-border rounded-2xl p-6 md:p-8">
              <div className="grid gap-5">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Target validation</div>
                    <div className="text-sm text-muted-foreground">
                      Check URL reachability and basic security posture before scanning.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                    <Scan className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Flexible scan modes</div>
                    <div className="text-sm text-muted-foreground">
                      Use preset modes or select custom tools for advanced workflows.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Actionable reporting</div>
                    <div className="text-sm text-muted-foreground">
                      Summaries + details to prioritize fixes and track progress over time.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-3 text-muted-foreground">A simple workflow designed for speed and clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1) Add your target</h3>
              <p className="text-muted-foreground">
                Enter the URL you want to assess. We validate it before scanning.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Scan className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2) Choose mode/tools</h3>
              <p className="text-muted-foreground">
                Pick a scan mode or select custom tools based on your objective.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3) Review reports</h3>
              <p className="text-muted-foreground">
                View results, severity summaries, and remediation guidance in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Security Features</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vulnerability Scanning</h3>
              <p className="text-muted-foreground">
                Detect OWASP Top 10 vulnerabilities with our advanced scanning engine.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SSL/TLS Analysis</h3>
              <p className="text-muted-foreground">
                Identify weak cipher suites, outdated protocols, and certificate issues.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Reports</h3>
              <p className="text-muted-foreground">
                Get comprehensive reports with remediation advice for all identified issues.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Firewall Detection</h3>
              <p className="text-muted-foreground">
                Detect WAFs and other defensive measures protecting your applications.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">HTTP Security Headers</h3>
              <p className="text-muted-foreground">
                Analyze security-related HTTP headers to improve your application's security posture.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Network Scanning</h3>
              <p className="text-muted-foreground">
                Discover open ports and services that might introduce security risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Securing Your Applications Today</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that trust AI Enhanced Penetration Testing for their penetration testing needs.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Sign Up For Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
