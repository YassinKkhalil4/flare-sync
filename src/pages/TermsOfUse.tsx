
import { FileText } from 'lucide-react';

const TermsOfUse = () => {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Terms of Use</h1>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground">Last updated: April 26, 2025</p>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using FlareSync ("we," "our," or "us"), you agree to these Terms of Use and all applicable laws and regulations. If you do not agree with these terms, please do not use our service.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
          <p>You must be at least 18 years old to use FlareSync. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Use the service for any illegal purpose</li>
            <li>Violate any intellectual property rights</li>
            <li>Upload malicious content or code</li>
            <li>Attempt to gain unauthorized access to other accounts</li>
            <li>Interfere with the proper functioning of the service</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">4. Service Modifications</h2>
          <p>We reserve the right to modify, suspend, or discontinue any part of our service at any time without notice.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
          <p>For questions about these Terms of Use, please contact us at legal@flaresync.com</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfUse;
