
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, UserPlus } from 'lucide-react';

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-2">
      <Link to="/auth/signin">
        <Button variant="ghost" className="text-slate-300 hover:text-white">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
      <Link to="/auth/signup">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Sign Up
        </Button>
      </Link>
    </div>
  );
};

export default AuthButtons;
