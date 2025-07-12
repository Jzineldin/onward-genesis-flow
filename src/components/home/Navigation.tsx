
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, Crown } from 'lucide-react';
import SubscriptionStatus from '@/components/SubscriptionStatus';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">
            TaleForge
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2"
            >
              <Crown className="h-4 w-4" />
              Pricing
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <SubscriptionStatus />
                
                <Link
                  to="/my-stories"
                  className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  My Stories
                </Link>

                <div className="flex items-center gap-2 text-white/80">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>

                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
