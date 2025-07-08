
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Home, Clock, PenTool, Globe } from 'lucide-react';
import UserMenu from '@/components/auth/UserMenu';
import AuthButtons from '@/components/auth/AuthButtons';
import ChangelogModal from './ChangelogModal';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/create-story')) {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const isCreateStoryActive = () => location.pathname === '/create-story';

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-white hover:text-primary transition-colors cursor-pointer font-heading"
          >
            TaleForge
          </Link>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-4">
            {/* What's New Button */}
            <ChangelogModal />
            
            {user ? (
              <>
                {/* Navigation Links for authenticated users */}
                <nav className="hidden md:flex items-center gap-4">
                  <Link 
                    to="/" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  {isCreateStoryActive() && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground">
                      <PenTool className="h-4 w-4" />
                      Creating Story
                    </div>
                  )}
                  <Link 
                     to="/my-stories" 
                     className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                       isActive('/my-stories') 
                         ? 'bg-primary text-primary-foreground' 
                         : 'text-slate-300 hover:text-white hover:bg-slate-800'
                     }`}
                   >
                     <Clock className="h-4 w-4" />
                     My Stories
                   </Link>
                   <Link 
                     to="/public-stories" 
                     className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                       isActive('/public-stories') 
                         ? 'bg-primary text-primary-foreground' 
                         : 'text-slate-300 hover:text-white hover:bg-slate-800'
                     }`}
                   >
                     <Globe className="h-4 w-4" />
                     Public Library
                   </Link>
                </nav>

                {/* User Menu */}
                <UserMenu />
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Navigation Links for anonymous users */}
                <nav className="hidden md:flex items-center gap-4">
                  <Link 
                    to="/" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive('/') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  {isCreateStoryActive() && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground">
                      <PenTool className="h-4 w-4" />
                      Creating Story
                    </div>
                  )}
                  <Link 
                     to="/my-stories" 
                     className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                       isActive('/my-stories') 
                         ? 'bg-primary text-primary-foreground' 
                         : 'text-slate-300 hover:text-white hover:bg-slate-800'
                     }`}
                     title="View your temporary stories (saved locally)"
                   >
                     <Clock className="h-4 w-4" />
                     <span className="hidden lg:inline">My Stories</span>
                     <span className="lg:hidden">Stories</span>
                     <span className="text-xs bg-orange-500 text-white px-1 rounded">Local</span>
                   </Link>
                   <Link 
                     to="/public-stories" 
                     className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                       isActive('/public-stories') 
                         ? 'bg-primary text-primary-foreground' 
                         : 'text-slate-300 hover:text-white hover:bg-slate-800'
                     }`}
                   >
                     <Globe className="h-4 w-4" />
                     <span className="hidden lg:inline">Public Library</span>
                     <span className="lg:hidden">Public</span>
                   </Link>
                </nav>

                <AuthButtons />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
