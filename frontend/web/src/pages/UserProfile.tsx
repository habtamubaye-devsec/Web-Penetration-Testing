
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { changePassword, updateUserProfile } from '@/api-service/user.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Save, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordInput } from '@/components/ui/password-input';

export default function UserProfile() {
  const { user, token, setSession, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxiosMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    if (typeof maybeAxiosMessage === 'string' && maybeAxiosMessage.trim()) return maybeAxiosMessage;
    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    
    const userId = user?._id || user?.id;
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Missing user ID. Please re-login and try again.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (imageFile) formData.append('image', imageFile);

      await updateUserProfile(userId, formData);

      // Refresh current user in AuthContext
      try {
        const me = await api.get('/auth/me');
        const nextUser = me.data?.data?.user;
        if (token && nextUser) await setSession(token, nextUser);
      } catch {
        // Profile update succeeded even if /auth/me refresh fails.
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to update profile. Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to update password. Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Update your account settings and change your password
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <form onSubmit={handleProfileUpdate}>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={previewUrl ?? user?.image ?? ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Profile Picture</p>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      disabled={saving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload one image (max 5MB).
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={saving}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end border-t p-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Account Type</p>
                <div className="flex items-center">
                  {isAdmin ? (
                    <>
                      <Shield className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Administrator</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Regular User</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Account ID</p>
                <p className="text-xs font-mono bg-muted p-1 rounded">
                  {user?._id || user?.id}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <form onSubmit={handlePasswordUpdate}>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <PasswordInput 
                    id="currentPassword" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordInput 
                    id="newPassword" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <PasswordInput 
                    id="confirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
