
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  deleteUser,
  getAllUsers,
  toggleUserStatus,
  type UserListItem,
} from '@/api-service/user.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  MoreHorizontal,
  User,
  ExternalLink,
  Search,
  X,
  Ban,
  Check,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserData = UserListItem;

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxiosMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    if (typeof maybeAxiosMessage === 'string' && maybeAxiosMessage.trim()) return maybeAxiosMessage;
    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Robust close behavior: if Radix outside-dismiss is blocked by layout/CSS,
  // we still close the currently open menu on any outside pointer down.
  useEffect(() => {
    if (!openMenuUserId) return;

    const handler = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest(`[data-user-menu-trigger="${openMenuUserId}"]`)) return;
      if (target.closest(`[data-user-menu-content="${openMenuUserId}"]`)) return;

      setOpenMenuUserId(null);
    };

    window.addEventListener('pointerdown', handler, true);
    return () => window.removeEventListener('pointerdown', handler, true);
  }, [openMenuUserId]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setActionLoading(true);
    
    try {
      await deleteUser(userToDelete.id);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      
      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been deleted successfully.`,
      });
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error, 'Failed to delete user. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: UserData) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    
    try {
      await toggleUserStatus(user.id, newStatus);
      
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === user.id ? { ...u, status: newStatus as 'active' | 'blocked' } : u
      ));
      
      toast({
        title: `User ${newStatus}`,
        description: `${user.name} has been ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error, 'Failed to update user status. Please try again.'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users on the platform
        </p>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} total users found
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image ?? ''} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="capitalize">{user.role || 'client'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-status-success' : 'bg-status-danger'}`} />
                        <span className="capitalize">{user.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu
                        modal={false}
                        open={openMenuUserId === user.id}
                        onOpenChange={(open) => setOpenMenuUserId(open ? user.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            data-user-menu-trigger={user.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" data-user-menu-content={user.id}>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setOpenMenuUserId(null);
                              navigate(`/admin/users/${user.id}`);
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user)}
                            className={user.status === 'active' ? "text-status-warning" : "text-status-success"}
                            disabled={actionLoading}
                          >
                            {user.status === 'active' ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Block User</span>
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                <span>Activate User</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)} 
                            className="text-status-danger"
                            disabled={actionLoading}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete User</span>
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

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setUserToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
            <DialogDescription>
              This will permanently delete {userToDelete?.name}'s account and all associated data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
