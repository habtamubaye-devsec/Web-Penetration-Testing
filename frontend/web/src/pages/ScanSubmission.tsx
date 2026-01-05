
import React, { useState, useEffect } from 'react';
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
  Info,
  Globe,
  Activity,
  Clock
} from 'lucide-react';
import { submitScan } from '@/api-service/scan.service';
import { getScanningTools, getScanModes, type ScanningTool, type ScanMode } from '@/api-service/scanning-management.service';
import { useToast } from '@/hooks/use-toast';

export default function ScanSubmission() {
  const [url, setUrl] = useState('');
  const [modes, setModes] = useState<ScanMode[]>([]);
  const [tools, setTools] = useState<ScanningTool[]>([]);
  const [selectedModeId, setSelectedModeId] = useState<string>('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleModeSelect = (modeId: string) => {
    setSelectedModeId(modeId);

    const nextMode = modes.find((m) => m._id === modeId);
    if (nextMode && nextMode.scanType !== 'custom') {
      setSelectedTools([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modesRes, toolsRes] = await Promise.all([
          getScanModes(),
          getScanningTools()
        ]);
        setModes(modesRes.data.data);
        setTools(toolsRes.data.data);
        if (modesRes.data.data.length > 0) {
          setSelectedModeId(modesRes.data.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching scan configuration:', error);
        toast({
          title: "Error",
          description: "Failed to load scan options. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToolToggle = (toolId: string) => {
    if (!toolId) return;
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleToolCheckedChange = (toolId: string, checked: boolean | "indeterminate") => {
    if (!toolId) return;
    if (checked === "indeterminate") return;

    setSelectedTools((prev) => {
      const isSelected = prev.includes(toolId);
      if (checked && !isSelected) return [...prev, toolId];
      if (!checked && isSelected) return prev.filter((id) => id !== toolId);
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast({ title: "Error", description: "Please enter a target URL", variant: "destructive" });
      return;
    }

    try {
      new URL(url);
    } catch {
      toast({ title: "Invalid URL", description: "Include http:// or https://", variant: "destructive" });
      return;
    }

    const mode = modes.find(m => m._id === selectedModeId);
    if (!mode) return;

    if (mode.scanType === 'custom' && selectedTools.length === 0) {
      toast({ title: "Error", description: "Select at least one tool for custom scan", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const scanData = {
        url,
        scan_mode_id: selectedModeId,
        custom_tools: mode.scanType === 'custom' ? selectedTools : undefined
      };

      await submitScan(scanData);

      toast({
        title: "Scan Queued",
        description: "Your security assessment has been scheduled.",
      });
      navigate('/scan-history');
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Internal server error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getIconForTool = (type: string) => {
    switch (type) {
      case 'network': return Network;
      case 'ssl': return Lock;
      case 'waf': return Shield;
      case 'http': return AlertTriangle;
      case 'nse': return FileCode;
      default: return Activity;
    }
  };

  const getIconForMode = (type: string) => {
    switch (type) {
      case 'fast': return ShieldCheck;
      case 'full': return Shield;
      case 'custom': return ShieldAlert;
      default: return Globe;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing security scanner...</p>
      </div>
    );
  }

  if (modes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
        <div className="p-4 bg-muted rounded-full">
          <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">No Scan Modes Available</h3>
          <p className="text-muted-foreground max-w-xs">
            The administrator hasn't configured any scanning modes yet. Please check back later.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry Connection
        </Button>
      </div>
    );
  }

  const currentMode = modes.find(m => m._id === selectedModeId);

  return (
    <div className="animate-slide-up flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          New Security Scan
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Configure and initiate a security assessment.
        </p>
      </div>

      <Card className="border-border/50 shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b bg-muted/20 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Configuration</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Specify your target and choose an assessment depth.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6 px-4 sm:px-6">
            {/* Target URL */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Target URL
              </Label>
              <div className="relative">
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={submitting}
                  required
                  className="h-11 text-sm sm:text-base pl-4 border-2 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Enter the fully qualified domain name including the protocol (http/https).
                  Ensure you have explicit authorization to scan this target.
                </p>
              </div>
            </div>

            {/* Scan Modes */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Assessment Mode</Label>
              <RadioGroup
                value={selectedModeId}
                onValueChange={handleModeSelect}
                className="grid gap-3"
              >
                {modes.map((mode) => {
                  const Icon = getIconForMode(mode.scanType);
                  const isSelected = selectedModeId === mode._id;

                  return (
                    <div
                      key={mode._id}
                      className={`relative border-2 rounded-2xl transition-all duration-300 group ${isSelected
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                        : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'
                        }`}
                    >
                      <Label
                        htmlFor={mode._id}
                        className="flex items-start space-x-4 p-4 cursor-pointer"
                      >
                        <RadioGroupItem value={mode._id} id={mode._id} className="mt-1.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-base font-semibold flex items-center gap-2">
                              <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`} />
                              {mode.name}
                            </div>
                            {mode.estimatedTime && (
                              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {mode.estimatedTime}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground pr-4">
                            {mode.description}
                          </p>
                        </div>
                      </Label>

                      {/* Custom Tools Subset (kept OUTSIDE the label so it can't interfere with mode selection) */}
                      {isSelected && mode.scanType === 'custom' && (
                        <div className="px-4 pb-4 mt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="h-px bg-primary/20 w-full" />
                          <p className="text-sm font-bold uppercase tracking-widest text-primary/80">Select Components:</p>

                          <div className="grid gap-3 sm:grid-cols-2 max-h-64 overflow-auto pr-1">
                            {tools.filter((t) => Boolean(t?._id)).map((tool) => {
                              const ToolIcon = getIconForTool(tool.type);
                              const isChecked = selectedTools.includes(tool._id);
                              return (
                                <div
                                  key={tool._id}
                                  className={`flex items-start space-x-4 p-3 rounded-xl border-2 transition-all duration-200 ${isChecked
                                    ? 'border-primary/60 bg-primary/10'
                                    : 'border-border/40 hover:border-primary/30 bg-background/50'
                                    }`}
                                >
                                  <Checkbox
                                    id={tool._id}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => handleToolCheckedChange(tool._id, checked)}
                                    className="mt-1"
                                  />
                                  <div>
                                    <Label htmlFor={tool._id} className="font-bold flex items-center gap-2 cursor-pointer">
                                      <ToolIcon className="h-4 w-4 text-primary" />
                                      {tool.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                                      {tool.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t bg-muted/10 p-4 sm:p-6">
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="h-11 px-8 text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Requesting Scan...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Initiate Scan
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
