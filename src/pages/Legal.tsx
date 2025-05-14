
import React from 'react';
import { FileText } from 'lucide-react';

const Legal = () => {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Legal Information</h1>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground">Last updated: May 14, 2025</p>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Legal Overview</h2>
          <p>
            Welcome to FlareSync's legal information page. Here you can find important documents 
            regarding your use of our platform and services.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Available Documents</h2>
          
          <div className="space-y-4 mt-6">
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-medium">Terms of Use</h3>
              <p className="mt-2 text-muted-foreground">
                The terms governing your use of the FlareSync platform.
              </p>
              <a href="/terms" className="mt-4 inline-flex items-center text-primary hover:underline">
                Read Terms of Use <FileText className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-medium">Privacy Policy</h3>
              <p className="mt-2 text-muted-foreground">
                How we collect, use, and protect your personal information.
              </p>
              <a href="/privacy" className="mt-4 inline-flex items-center text-primary hover:underline">
                Read Privacy Policy <FileText className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-medium">Terms & Conditions</h3>
              <p className="mt-2 text-muted-foreground">
                Detailed terms & conditions for our services and subscriptions.
              </p>
              <a href="/terms" className="mt-4 inline-flex items-center text-primary hover:underline">
                Read Terms & Conditions <FileText className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>
            If you have any questions about our legal documents, please contact us at{' '}
            <a href="mailto:legal@flaresync.com" className="text-primary hover:underline">
              legal@flaresync.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Legal;
