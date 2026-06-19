'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const tempErrors: any = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email is invalid';
    if (!password) tempErrors.password = 'Password is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email, password });
      showToast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      showToast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login({ email: 'demo@civic.gov', password: 'password123' });
      showToast.info('Logged in as Demo Citizen User');
      router.push('/dashboard');
    } catch (err: any) {
      showToast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-cyan-600/10 blur-[120px]" />

      <Card className="w-full max-w-md p-6">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 shadow-md shadow-indigo-500/20 mb-4">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="font-heading text-2xl font-bold text-white">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access the platform</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={loading}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={loading}
              required
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-6">
            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-indigo-400 font-semibold"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Sign In with Demo Account
            </Button>
            <p className="text-center text-xs text-zinc-500 mt-2">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-medium underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
