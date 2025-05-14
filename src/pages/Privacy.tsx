
import { FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground">Last updated: May 14, 2025</p>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>At FlareSync, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Personal information (name, email address, etc.)</li>
            <li>Account credentials</li>
            <li>Payment information</li>
            <li>Social media account information</li>
            <li>Content you create, upload, or post</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>We use your information for various purposes, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Providing and maintaining our service</li>
            <li>Processing your transactions</li>
            <li>Sending you service-related communications</li>
            <li>Improving our service</li>
            <li>Responding to your inquiries and support requests</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at privacy@flaresync.com</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
