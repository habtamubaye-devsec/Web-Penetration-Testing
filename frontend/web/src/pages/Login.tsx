
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { decodeJwtPayload } from '@/lib/jwt';
import { PasswordInput } from '@/components/ui/password-input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('oauthError');
    const provider = params.get('provider');

    if (oauthError === '1') {
      const providerLabel = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'OAuth';
      toast({
        title: 'Login failed',
        description: `${providerLabel} authentication failed. Please try again.`,
        variant: 'destructive',
      });

      // Clean the query params so the toast doesn't reappear on refresh.
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);

      const token = localStorage.getItem('securityToken') || '';
      const role = decodeJwtPayload(token)?.role;
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Shield className="h-12 w-12 text-primary" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SocialAuthButtons disabled={isSubmitting} />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </div>
              </form>

              {/* <div className="mt-4 text-center text-sm">
                <p>
                  For demo purposes, you can use:
                </p>
                <p className="text-muted-foreground">
                  Admin: admin@example.com / password
                </p>
                <p className="text-muted-foreground">
                  User: user@example.com / password
                </p>
              </div> */}
            </div>
          </CardContent>

          <CardFooter>
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground">
                Don't have an account? {' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
