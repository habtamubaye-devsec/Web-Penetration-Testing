
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScanHistory, type ScanStatus } from '@/api-service/scan.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Search, 
  X, 
  MoreHorizontal, 
  ExternalLink,
  FileText,
  Trash2,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/hooks/use-toast';

interface ScanItem {
  id: string;
  url: string;
  type: string;
  status: ScanStatus;
  date: string;
  vulnerabilities: number | null;
}

export default function AdminScans() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredScans, setFilteredScans] = useState<ScanItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await getScanHistory();
        setScans(response.data);
        setFilteredScans(response.data);
      } catch (error) {
        console.error('Error fetching scans:', error);
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

  const handleDeleteScan = async (scanId: string) => {
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setScans(prevScans => prevScans.filter(scan => scan.id !== scanId));
      setFilteredScans(prevScans => prevScans.filter(scan => scan.id !== scanId));
      
      toast({
        title: "Scan deleted",
        description: "The scan has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast({
        title: "Error",
        description: "Failed to delete scan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Scans</h1>
        <p className="text-muted-foreground">
          View and manage all security scans on the platform
        </p>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scans by URL or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Scans</CardTitle>
          <CardDescription>
            {filteredScans.length} total scans found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vulnerabilities</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="font-medium truncate max-w-[200px]">
                      {scan.url}
                    </TableCell>
                    <TableCell>{scan.type}</TableCell>
                    <TableCell>
                      <StatusBadge status={scan.status} />
                    </TableCell>
                    <TableCell>{new Date(scan.date).toLocaleString()}</TableCell>
                    <TableCell>
                      {scan.status === 'completed' ? (
                        <span className={scan.vulnerabilities ? 'text-status-danger font-medium' : 'text-status-success font-medium'}>
                          {scan.vulnerabilities || 0}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/scans/${scan.id}`} className="flex items-center">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          {scan.status === 'completed' && (
                            <DropdownMenuItem className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Export Report</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteScan(scan.id)}
                            className="text-status-danger flex items-center"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Scan</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
