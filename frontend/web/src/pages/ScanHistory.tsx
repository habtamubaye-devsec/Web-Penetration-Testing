
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScanHistory, type ScanStatus } from '@/api-service/scan.service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ExternalLink,
  Calendar,
  Search,
  X,
  Shield,
  FileSearch,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ScanItem {
  id: string;
  url: string;
  type: string;
  status: ScanStatus;
  date: string;
  vulnerabilities: number | null;
}

export default function ScanHistory() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredScans, setFilteredScans] = useState<ScanItem[]>([]);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await getScanHistory();
        setScans(response.data);
        setFilteredScans(response.data);
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredScans(scans);
    } else {
      const filtered = scans.filter(scan =>
        scan.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredScans(filtered);
    }
  }, [searchTerm, scans]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Scan History</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            View and analyze your previous security scans
          </p>
        </div>
        <Link to="/scan">
          <Button size="lg" className="btn-scale shadow-md shadow-primary/20">
            <Shield className="mr-2 h-5 w-5" />
            New Scan
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search scans by URL, type, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 focus-visible-ring"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-9 w-9 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Scans Table */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-2xl">Scan Results</CardTitle>
          <CardDescription className="text-base mt-1.5">
            {filteredScans.length} {filteredScans.length === 1 ? 'scan' : 'scans'} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading scan history...</p>
            </div>
          ) : filteredScans.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Target URL</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-center">Vulnerabilities</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScans.map((scan) => (
                    <TableRow key={scan.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="max-w-[300px] truncate font-medium">
                        <div className="flex items-center gap-2">
                          <FileSearch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{scan.url}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm font-medium px-2.5 py-1 rounded-md bg-muted">
                          {scan.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={scan.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">
                            {new Date(scan.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {scan.status === 'completed' ? (
                          <span className={`text-lg font-bold ${scan.vulnerabilities
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                            }`}>
                            {scan.vulnerabilities || 0}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/scan-result/${scan.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-1 hover:gap-2 transition-all"
                          >
                            View Details
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                {searchTerm ? (
                  <Search className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <Shield className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No matching scans found' : 'No scans yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : "You haven't run any scans yet. Start securing your applications now."
                }
              </p>
              {!searchTerm && (
                <Link to="/scan">
                  <Button className="btn-scale">
                    <Shield className="mr-2 h-4 w-4" />
                    Start Your First Scan
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
