import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { getUserById } from '@/api-service/user.service';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User as UserIcon } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import type { ScanStatus } from '@/api-service/scan.service';

type UserDetails = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  status: 'active' | 'blocked';
  createdAt?: string;
  updatedAt?: string;
};

type ScanReportItem = {
  scanId: string;
  url: string;
  scanType?: string;
  status: ScanStatus;
  submittedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [scanReports, setScanReports] = useState<ScanReportItem[]>([]);

  const safeUserId = useMemo(() => String(id || '').trim(), [id]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxiosMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    if (typeof maybeAxiosMessage === 'string' && maybeAxiosMessage.trim()) return maybeAxiosMessage;
    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
  };

  useEffect(() => {
    const fetchAll = async () => {
      if (!safeUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [userRes, scansRes] = await Promise.all([
          getUserById(safeUserId),
          api.get(`/scan/admin/user/${safeUserId}`),
        ]);

        const rawUser = userRes.data?.user;
        const mappedUser: UserDetails | null = rawUser
          ? {
              id: String(rawUser?._id ?? rawUser?.id ?? ''),
              name: String(rawUser?.name ?? ''),
              email: String(rawUser?.email ?? ''),
              role: String(rawUser?.role ?? 'client'),
              image: typeof rawUser?.image === 'string' ? rawUser.image : undefined,
              status: rawUser?.isActive ? 'active' : 'blocked',
              createdAt: typeof rawUser?.createdAt === 'string' ? rawUser.createdAt : undefined,
              updatedAt: typeof rawUser?.updatedAt === 'string' ? rawUser.updatedAt : undefined,
            }
          : null;

        setUser(mappedUser);

        const reports = (scansRes.data?.data?.reports ?? []) as Array<any>;
        const mappedReports: ScanReportItem[] = reports
          .map((r) => ({
            scanId: String(r?.scanId ?? ''),
            url: String(r?.url ?? ''),
            scanType: typeof r?.scanType === 'string' ? r.scanType : undefined,
            status: (String(r?.status ?? 'pending') as ScanStatus) || 'pending',
            submittedAt: typeof r?.submittedAt === 'string' ? r.submittedAt : undefined,
            completedAt: typeof r?.completedAt === 'string' ? r.completedAt : undefined,
            createdAt: typeof r?.createdAt === 'string' ? r.createdAt : undefined,
            updatedAt: typeof r?.updatedAt === 'string' ? r.updatedAt : undefined,
          }))
          .filter((r) => r.scanId);

        setScanReports(mappedReports);
      } catch (error) {
        console.error('Failed to load user detail:', error);
        toast({
          title: 'Error',
          description: getErrorMessage(error, 'Failed to load user details. Please try again.'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [safeUserId, toast]);

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link to="/admin/users" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to users
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>User not found</CardTitle>
            <CardDescription>We couldn’t load this user.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">Profile information and scan history</p>
        </div>

        <Button variant="outline" asChild>
          <Link to="/admin/users" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Basic user account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.image ?? ''} />
              <AvatarFallback>
                <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="text-lg font-semibold">{user.name || '—'}</div>
              <div className="text-sm text-muted-foreground">{user.email || '—'}</div>
              <div className="text-sm">
                <span className="capitalize">{user.role || 'client'}</span>
                <span className="text-muted-foreground"> • </span>
                <span className="capitalize">{user.status}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {formatDate(user.createdAt)}
                <span className="text-muted-foreground"> • </span>
                Updated: {formatDate(user.updatedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>{scanReports.length} scans found</CardDescription>
        </CardHeader>
        <CardContent>
          {scanReports.length === 0 ? (
            <div className="text-sm text-muted-foreground">No scans found for this user.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scan ID</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanReports.map((r) => (
                  <TableRow key={r.scanId}>
                    <TableCell className="font-medium">{r.scanId}</TableCell>
                    <TableCell className="truncate max-w-[260px]">{r.url}</TableCell>
                    <TableCell className="capitalize">{r.scanType || 'full'}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>{formatDate(r.submittedAt || r.createdAt)}</TableCell>
                    <TableCell>{formatDate(r.completedAt)}</TableCell>
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
