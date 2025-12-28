
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
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ArrowLeft,
  Download,
  Globe,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import SeverityBadge from '@/components/common/SeverityBadge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Reusing the same interface from ScanResult.tsx
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
  // Additional fields that might be useful for admin view
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminScanDetail() {
  const { scanId } = useParams<{ scanId: string }>();
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanResult = async () => {
      if (!scanId) return;
      
      try {
        const response = await getScanResult(scanId);
        
        // In a real app, we'd get user information as well
        const enhancedData = {
          ...response.data,
          user: {
            id: '2',
            name: 'Regular User',
            email: 'user@example.com',
          },
        };
        
        setScanResult(enhancedData);
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
          <Link to="/admin/scans" className="text-primary hover:underline flex items-center mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to All Scans
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Scan Details</h1>
          {!loading && scanResult && (
            <p className="text-muted-foreground">
              Admin view for scan {scanId}
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
                Administrative information about this security scan
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
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">User</div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-primary mr-2" />
                    <div className="font-medium">{scanResult.user?.name}</div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">User ID</div>
                    <div className="font-mono text-sm">{scanResult.user?.id}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">User Email</div>
                    <div>{scanResult.user?.email}</div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {scanResult.status === 'completed' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Vulnerability Summary</h3>
                  
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
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Findings section - similar to the user view but with admin capabilities */}
          {scanResult.status === 'completed' && scanResult.findings && scanResult.findings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Findings</CardTitle>
                <CardDescription>
                  Complete vulnerability assessment results
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {scanResult.findings.map((finding) => (
                  <div key={finding.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold">{finding.title}</h3>
                      <div className="flex items-center space-x-2">
                        <SeverityBadge severity={finding.severity} />
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4 text-sm">
                      <div className="space-y-1">
                        <div className="font-medium">ID</div>
                        <div className="font-mono bg-muted px-2 py-1 rounded inline-block">
                          {finding.id}
                        </div>
                      </div>
                      
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
                      
                      <div className="space-y-1">
                        <div className="font-medium">Additional Notes</div>
                        <Alert>
                          <AlertTitle>Admin Note</AlertTitle>
                          <AlertDescription>
                            This finding has been verified by the security team and represents a genuine vulnerability.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Scan not found or you don't have permission to view this scan.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
