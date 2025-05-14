
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">Welcome to FlareSync</h1>
      <p className="text-xl text-gray-600 text-center max-w-2xl mb-10">
        The all-in-one platform for creators to manage social media, schedule content, and monetize their audience.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button asChild size="lg">
          <Link to="/login">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/plans">View Plans</Link>
        </Button>
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/terms">Terms of Use</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/privacy">Privacy Policy</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin-login">Admin Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
