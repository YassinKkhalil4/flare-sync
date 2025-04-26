
import { FileText } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground">Last updated: April 26, 2025</p>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p>These Terms & Conditions constitute a legally binding agreement between you and FlareSync regarding your use of our platform and services.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">2. Privacy Policy</h2>
          <p>Your use of FlareSync is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">3. Subscription Terms</h2>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Subscription fees are billed in advance</li>
            <li>You may cancel your subscription at any time</li>
            <li>Refunds are handled according to our refund policy</li>
            <li>We reserve the right to change subscription pricing</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">4. Content Rights</h2>
          <p>You retain all rights to the content you post on FlareSync. By using our service, you grant us a license to host and display your content.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
          <p>FlareSync is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of our service.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
          <p>These terms are governed by the laws of the jurisdiction in which FlareSync is based, without regard to its conflict of law principles.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
