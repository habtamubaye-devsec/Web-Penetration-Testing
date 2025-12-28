
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScanHistory } from '@/api-service/scan.service';
import { getAllUsers } from '@/api-service/user.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart as BarChartIcon, 
  Users, 
  Shield, 
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ScanData {
  id: string;
  url: string;
  type: string;
  status: string;
  date: string;
  vulnerabilities: number | null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
  lastLogin?: string;
  status: string;
}

// Mock data for charts
const vulnerabilityData = [
  { name: 'SQL Injection', count: 12, fill: '#DC3545' },
  { name: 'XSS', count: 18, fill: '#DC3545' },
  { name: 'CSRF', count: 8, fill: '#FFC107' },
  { name: 'Weak Cipher', count: 14, fill: '#FFC107' },
  { name: 'Missing Headers', count: 22, fill: '#28A745' },
  { name: 'Info Disclosure', count: 15, fill: '#3E92CC' },
];

const scanActivityData = [
  { name: 'Mon', scans: 12 },
  { name: 'Tue', scans: 19 },
  { name: 'Wed', scans: 15 },
  { name: 'Thu', scans: 22 },
  { name: 'Fri', scans: 25 },
  { name: 'Sat', scans: 18 },
  { name: 'Sun', scans: 14 },
];

export default function AdminDashboard() {
  const [recentScans, setRecentScans] = useState<ScanData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scansResponse, usersResponse] = await Promise.all([
          getScanHistory(),
          getAllUsers(),
        ]);
        
        setRecentScans(scansResponse.data.slice(0, 5));
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const completedScans = recentScans.filter(scan => scan.status === 'completed').length;
  const pendingScans = recentScans.filter(scan => scan.status === 'pending').length;
  const failedScans = recentScans.filter(scan => scan.status === 'failed').length;
  const activeUsers = users.filter(user => user.status === 'active').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor system activity and manage security scans
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Scans
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentScans.length}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Completed Scans
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-status-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedScans}</div>
            <p className="text-xs text-muted-foreground">
              {pendingScans} pending, {failedScans} failed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Vulnerabilities
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              30 high, 42 medium, 17 low
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Vulnerability Distribution</CardTitle>
            <CardDescription>
              Most common vulnerability types across all scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vulnerabilityData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Bar dataKey="count" name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Scan Activity</CardTitle>
            <CardDescription>
              Number of scans over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scanActivityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Bar dataKey="scans" name="Scans" fill="#3E92CC" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Recently active platform users
              </CardDescription>
            </div>
            <Link to="/admin/users">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-status-success' : 'bg-status-danger'}`}></div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleDateString()}` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>
                Latest security scans across the platform
              </CardDescription>
            </div>
            <Link to="/admin/scans">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {scan.status === 'completed' && <CheckCircle className="h-4 w-4 text-status-success" />}
                    {scan.status === 'pending' && <Clock className="h-4 w-4 text-status-pending" />}
                    {scan.status === 'failed' && <AlertTriangle className="h-4 w-4 text-status-danger" />}
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{scan.url}</p>
                      <p className="text-sm text-muted-foreground">{scan.type} Scan</p>
                    </div>
                  </div>
                  <Link to={`/admin/scans/${scan.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
