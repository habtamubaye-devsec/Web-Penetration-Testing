import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { resetPassword } from '@/api-service/auth.service';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid or missing reset token",
        variant: "destructive",
      });
      return;
    }
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, { password });
      toast({
        title: "Success",
        description: "Your password has been reset. You can now log in.",
      });
      navigate('/login');
    } catch (error) {
      const messageFromApi = (error as any)?.response?.data?.message;
      toast({
        title: "Error",
        description:
          typeof messageFromApi === 'string' && messageFromApi.trim()
            ? messageFromApi
            : error instanceof Error
              ? error.message
              : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-16 space-y-4">
      <h2 className="text-2xl font-bold text-center">Reset Password</h2>
      <PasswordInput
        placeholder="Enter new password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}