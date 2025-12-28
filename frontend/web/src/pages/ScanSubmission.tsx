
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Network,
  Lock,
  AlertTriangle,
  FileCode,
  Loader2,
  Info
} from 'lucide-react';
import { submitScan } from '@/api-service/scan.service';
import { useToast } from '@/hooks/use-toast';

export default function ScanSubmission() {
  const [url, setUrl] = useState('');
  const [scanType, setScanType] = useState('basic');
  const [customOptions, setCustomOptions] = useState({
    network: false,
    ssl: false,
    firewall: false,
    http: false,
    nse: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCustomOptionChange = (option: keyof typeof customOptions) => {
    setCustomOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }

    // Validate custom options
    if (scanType === 'custom' && !Object.values(customOptions).some(Boolean)) {
      toast({
        title: "Error",
        description: "Please select at least one custom scan option",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const scanData = {
        url,
        type: scanType,
        options: scanType === 'custom' ? customOptions : {},
      };

      const response = await submitScan(scanData);

      toast({
        title: "Scan submitted successfully",
        description: "You will be notified when your scan is complete",
      });
      navigate('/scan-history');
    } catch (error) {
      console.error('Error submitting scan:', error);
      toast({
        title: "Error",
        description: "Failed to submit scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ScanTypeOption = ({
    value,
    icon: Icon,
    iconColor,
    title,
    description,
    children
  }: {
    value: string;
    icon: React.ElementType;
    iconColor: string;
    title: string;
    description: string;
    children?: React.ReactNode;
  }) => (
    <div className={`flex items-start space-x-3 border rounded-lg p-5 transition-all duration-200 cursor-pointer ${scanType === value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50 hover:bg-muted/30'
      }`}>
      <RadioGroupItem value={value} id={value} className="mt-1" />
      <div className="flex-1">
        <Label htmlFor={value} className="text-base font-semibold flex items-center cursor-pointer gap-2 mb-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </Label>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">New Security Scan</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Configure and submit a new security scan
        </p>
      </div>

      <Card className="max-w-4xl mx-auto border-border/50 shadow-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-2xl">Scan Configuration</CardTitle>
            <CardDescription className="text-base mt-1.5">
              Enter the target URL and select your scan options
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-8">
            {/* Target URL */}
            <div className="space-y-3">
              <Label htmlFor="url" className="text-base font-semibold">Target URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={submitting}
                required
                className="h-12 text-base focus-visible-ring"
              />
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Enter the full URL including http:// or https://
                </p>
              </div>
            </div>

            {/* Scan Type */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Scan Type</Label>
              <RadioGroup
                value={scanType}
                onValueChange={setScanType}
                className="space-y-3"
              >
                <ScanTypeOption
                  value="basic"
                  icon={ShieldCheck}
                  iconColor="text-blue-600 dark:text-blue-400"
                  title="Basic Scan"
                  description="Quick security assessment with minimal server load. Completes in 2-5 minutes."
                />

                <ScanTypeOption
                  value="full"
                  icon={Shield}
                  iconColor="text-primary"
                  title="Full Scan"
                  description="Comprehensive security testing including all vulnerability types. May take 10-20 minutes."
                />

                <ScanTypeOption
                  value="custom"
                  icon={ShieldAlert}
                  iconColor="text-amber-600 dark:text-amber-400"
                  title="Custom Scan"
                  description="Select specific test categories to include in your scan."
                >
                  {scanType === 'custom' && (
                    <div className="mt-5 space-y-4 p-4 border-t border-border">
                      <p className="text-sm font-medium text-muted-foreground">Select scan options:</p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                          <Checkbox
                            id="network"
                            checked={customOptions.network}
                            onCheckedChange={() => handleCustomOptionChange('network')}
                          />
                          <div className="flex-1">
                            <Label htmlFor="network" className="flex items-center cursor-pointer font-medium gap-2">
                              <Network className="h-4 w-4 text-primary" />
                              Network Scanning
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Port scanning and service discovery
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                          <Checkbox
                            id="ssl"
                            checked={customOptions.ssl}
                            onCheckedChange={() => handleCustomOptionChange('ssl')}
                          />
                          <div className="flex-1">
                            <Label htmlFor="ssl" className="flex items-center cursor-pointer font-medium gap-2">
                              <Lock className="h-4 w-4 text-primary" />
                              SSL/TLS Analysis
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Certificate verification and cipher suite checks
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                          <Checkbox
                            id="firewall"
                            checked={customOptions.firewall}
                            onCheckedChange={() => handleCustomOptionChange('firewall')}
                          />
                          <div className="flex-1">
                            <Label htmlFor="firewall" className="flex items-center cursor-pointer font-medium gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              Firewall Detection
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              WAF fingerprinting and evasion testing
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                          <Checkbox
                            id="http"
                            checked={customOptions.http}
                            onCheckedChange={() => handleCustomOptionChange('http')}
                          />
                          <div className="flex-1">
                            <Label htmlFor="http" className="flex items-center cursor-pointer font-medium gap-2">
                              <AlertTriangle className="h-4 w-4 text-primary" />
                              HTTP Security
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Security header analysis and misconfiguration checks
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors sm:col-span-2">
                          <Checkbox
                            id="nse"
                            checked={customOptions.nse}
                            onCheckedChange={() => handleCustomOptionChange('nse')}
                          />
                          <div className="flex-1">
                            <Label htmlFor="nse" className="flex items-center cursor-pointer font-medium gap-2">
                              <FileCode className="h-4 w-4 text-primary" />
                              NSE Scripts
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Run specialized Nmap scripts for deeper analysis
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </ScanTypeOption>
              </RadioGroup>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t bg-muted/30 p-6">
            <p className="text-sm text-muted-foreground">
              By submitting this scan, you confirm that you have permission to test this target.
            </p>
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="btn-scale shadow-md shadow-primary/20 w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Start Scan
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
