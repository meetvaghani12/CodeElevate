'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Code Review
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.subscription?.plan ? (
                  <span className="text-sm font-medium text-gray-600">
                    Plan: {user.subscription.plan}
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/pricing')}
                    className="text-sm"
                  >
                    Subscribe to Plan
                  </Button>
                )}
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="ml-4"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="ml-4">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 