
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
import { Loader2, User, Save, Mail, Shield, Upload, Key } from 'lucide-react';
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
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Update your account settings and manage your security
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Card */}
        <Card className="lg:col-span-2 border-border/50 shadow-md">
          <form onSubmit={handleProfileUpdate}>
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-2xl">Profile Information</CardTitle>
              <CardDescription className="text-base mt-1.5">
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full"></div>
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg relative">
                    <AvatarImage src={previewUrl ?? user?.image ?? ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2">Profile Picture</p>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Choose file or drag and drop</span>
                      </div>
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      disabled={saving}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    className="h-11 focus-visible-ring"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={saving}
                    className="h-11 focus-visible-ring"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t bg-muted/30 p-6">
              <Button
                type="submit"
                disabled={saving}
                size="lg"
                className="btn-scale shadow-md shadow-primary/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Account Info Card */}
          <Card className="border-border/50 shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-xl">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold">Administrator</span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold">Regular User</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-sm truncate">{user?.email}</span>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">Account ID</p>
                <p className="text-xs font-mono bg-background p-2 rounded border border-border truncate">
                  {user?._id || user?.id}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card className="border-border/50 shadow-md">
            <form onSubmit={handlePasswordUpdate}>
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Key className="h-5 w-5 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-base mt-1.5">
                  Update your account password
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <PasswordInput
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={saving}
                    className="focus-visible-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={saving}
                    className="focus-visible-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={saving}
                    className="focus-visible-ring"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t bg-muted/30 p-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full btn-scale"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Update Password
                    </>
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
