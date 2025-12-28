
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScanResult, type ScanStatus, type SeverityLevel } from '@/api-service/scan.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Globe,
  Clock,
  Calendar,
  ArrowLeft,
  Download,
  FileText,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import SeverityBadge from '@/components/common/SeverityBadge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';

interface Finding {
  id: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  location: string;
  remediation: string;
}

interface ScanResultData {
  id: string;
  url: string;
  type: string;
  status: ScanStatus;
  date: string;
  duration: string;
  summary: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: Finding[];
}

export default function ScanResult() {
  const { scanId } = useParams<{ scanId: string }>();
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanResult = async () => {
      if (!scanId) return;
      
      try {
        const response = await getScanResult(scanId);
        setScanResult(response.data);
      } catch (error) {
        console.error('Error fetching scan result:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScanResult();
  }, [scanId]);

  // Calculate total findings
  const totalFindings = scanResult?.summary ? 
    scanResult.summary.high + scanResult.summary.medium + scanResult.summary.low + scanResult.summary.info : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/scan-history" className="text-primary hover:underline flex items-center mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Scan History
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Scan Result</h1>
          {!loading && scanResult && (
            <p className="text-muted-foreground">
              Detailed results for scan {scanId}
            </p>
          )}
        </div>
        
        {!loading && scanResult && scanResult.status === 'completed' && (
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : scanResult ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Scan Overview</CardTitle>
              <CardDescription>
                Summary information about this security scan
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Target URL</div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-primary mr-2" />
                    <div className="font-medium">{scanResult.url}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <StatusBadge status={scanResult.status as any} />
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Scan Type</div>
                  <div className="font-medium">{scanResult.type}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <div className="font-medium">{new Date(scanResult.date).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Duration</div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-2" />
                    <div className="font-medium">{scanResult.duration}</div>
                  </div>
                </div>
              </div>
              
              {scanResult.status === 'completed' && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Vulnerability Summary</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">High Severity</div>
                        <div className="text-2xl font-bold text-status-danger">{scanResult.summary.high}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Medium Severity</div>
                        <div className="text-2xl font-bold text-status-warning">{scanResult.summary.medium}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Low Severity</div>
                        <div className="text-2xl font-bold text-status-success">{scanResult.summary.low}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Informational</div>
                        <div className="text-2xl font-bold text-status-info">{scanResult.summary.info}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {totalFindings > 0 && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Severity Distribution</span>
                        <span>{totalFindings} findings</span>
                      </div>
                      <div className="flex h-2 w-full rounded-full overflow-hidden">
                        {scanResult.summary.high > 0 && (
                          <div 
                            className="bg-status-danger h-full"
                            style={{ width: `${(scanResult.summary.high / totalFindings) * 100}%` }}
                          />
                        )}
                        {scanResult.summary.medium > 0 && (
                          <div 
                            className="bg-status-warning h-full"
                            style={{ width: `${(scanResult.summary.medium / totalFindings) * 100}%` }}
                          />
                        )}
                        {scanResult.summary.low > 0 && (
                          <div 
                            className="bg-status-success h-full"
                            style={{ width: `${(scanResult.summary.low / totalFindings) * 100}%` }}
                          />
                        )}
                        {scanResult.summary.info > 0 && (
                          <div 
                            className="bg-status-info h-full"
                            style={{ width: `${(scanResult.summary.info / totalFindings) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {scanResult.status === 'completed' && scanResult.findings && scanResult.findings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Findings</CardTitle>
                <CardDescription>
                  {scanResult.findings.length} vulnerabilities were detected
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="all">All Findings</TabsTrigger>
                    {scanResult.summary.high > 0 && (
                      <TabsTrigger value="high">High ({scanResult.summary.high})</TabsTrigger>
                    )}
                    {scanResult.summary.medium > 0 && (
                      <TabsTrigger value="medium">Medium ({scanResult.summary.medium})</TabsTrigger>
                    )}
                    {scanResult.summary.low > 0 && (
                      <TabsTrigger value="low">Low ({scanResult.summary.low})</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {scanResult.findings.map((finding) => (
                      <div key={finding.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold">{finding.title}</h3>
                          <SeverityBadge severity={finding.severity} />
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">Description</div>
                            <p className="text-muted-foreground">{finding.description}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="font-medium">Location</div>
                            <code className="bg-muted px-2 py-1 rounded">{finding.location}</code>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="font-medium">Remediation</div>
                            <p className="text-muted-foreground">{finding.remediation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="high" className="space-y-4">
                    {scanResult.findings
                      .filter((finding) => finding.severity === 'high')
                      .map((finding) => (
                        <div key={finding.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold">{finding.title}</h3>
                            <SeverityBadge severity={finding.severity} />
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div className="space-y-1">
                              <div className="font-medium">Description</div>
                              <p className="text-muted-foreground">{finding.description}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium">Location</div>
                              <code className="bg-muted px-2 py-1 rounded">{finding.location}</code>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium">Remediation</div>
                              <p className="text-muted-foreground">{finding.remediation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="medium" className="space-y-4">
                    {scanResult.findings
                      .filter((finding) => finding.severity === 'medium')
                      .map((finding) => (
                        <div key={finding.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold">{finding.title}</h3>
                            <SeverityBadge severity={finding.severity} />
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div className="space-y-1">
                              <div className="font-medium">Description</div>
                              <p className="text-muted-foreground">{finding.description}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium">Location</div>
                              <code className="bg-muted px-2 py-1 rounded">{finding.location}</code>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium">Remediation</div>
                              <p className="text-muted-foreground">{finding.remediation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="low" className="space-y-4">
                    {scanResult.findings
                      .filter((finding) => finding.severity === 'low')
                      .map((finding) => (
                        <div key={finding.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold">{finding.title}</h3>
                            <SeverityBadge severity={finding.severity} />
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div className="space-y-1">
                              <div className="font-medium">Description</div>
                              <p className="text-muted-foreground">{finding.description}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium">Location</div>
                              <code className="bg-muted px-2 py-1 rounded">{finding.location}</code>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium">Remediation</div>
                              <p className="text-muted-foreground">{finding.remediation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : scanResult.status === 'completed' ? (
            <Alert className="bg-status-success/10 text-status-success border-status-success/20">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>No vulnerabilities detected</AlertTitle>
              <AlertDescription>
                Great news! No security vulnerabilities were found in this scan. Continue to monitor your application regularly.
              </AlertDescription>
            </Alert>
          ) : scanResult.status === 'pending' ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-12 w-12 mb-4 animate-spin text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Scan in progress</h3>
                  <p className="text-muted-foreground mb-6">
                    Your security scan is currently running. This might take a few minutes to complete.
                  </p>
                  <Progress value={30} className="w-full max-w-md" />
                  <p className="text-sm text-muted-foreground mt-4">
                    You can close this page and check back later. We'll notify you when the scan is complete.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Scan Failed</AlertTitle>
              <AlertDescription>
                There was an issue completing this scan. Please try running the scan again or contact support if the problem persists.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-center">
            <div className="space-x-4">
              <Link to="/scan-history">
                <Button variant="outline">Back to Scan History</Button>
              </Link>
              <Link to="/scan">
                <Button>Run Another Scan</Button>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Scan not found</h3>
              <p className="text-muted-foreground mb-6">
                The scan you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link to="/scan-history">
                <Button>View Your Scans</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
