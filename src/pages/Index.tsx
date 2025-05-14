
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary mb-6">Welcome to FlareSync</h1>
          <p className="text-xl text-gray-600 mb-8">
            The all-in-one platform for creators and brands to connect, manage content, and grow together.
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            {user ? (
              <Button 
                className="px-8 py-6 text-lg" 
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button 
                className="px-8 py-6 text-lg" 
                onClick={() => window.location.href = "https://flaresync.org"}
              >
                Get Started
              </Button>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Connect Social Accounts</h3>
              <p className="text-gray-600">
                Link your Instagram, TikTok, and more with just a few clicks.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Schedule Posts</h3>
              <p className="text-gray-600">
                Plan and schedule your content across multiple platforms.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Manage Brand Deals</h3>
              <p className="text-gray-600">
                Find and manage collaborations with brands in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
