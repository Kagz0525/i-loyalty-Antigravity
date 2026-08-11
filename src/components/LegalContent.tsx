import React from 'react';
import { ArrowLeft } from 'lucide-react';

export type LegalType = 'terms' | 'privacy';

interface LegalContentProps {
  type: LegalType;
  onBack: () => void;
}

export default function LegalContent({ type, onBack }: LegalContentProps) {
  return (
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl overflow-y-auto max-h-[80vh] relative">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </button>

      {type === 'terms' ? (
        <article className="prose prose-sm prose-orange">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
          
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to i-Loyalty ("we", "our", or "us"). These Terms and Conditions govern your use of the i-Loyalty application and services. By accessing or using our app, you agree to be bound by these Terms. These Terms are governed by the laws of the Republic of South Africa.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">2. Account Registration</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              <strong>Vendors:</strong> To create a loyalty program, you must register for an account using a valid email address. You are responsible for maintaining the confidentiality of your account credentials and for configuring your loyalty program rules accurately.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Customers:</strong> To participate in loyalty programs, you must register for an account. By presenting your QR code to a Vendor to receive a loyalty point, you explicitly consent to sharing your profile information (Name, Email, Phone Number) with that Vendor and agree to join their specific loyalty program.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">3. Vendor Data Obligations & POPIA Compliance</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              As a Vendor, when you scan a customer's QR code to assign a loyalty point, you are collecting their personal information. By using i-Loyalty, you agree to the following data protection rules in accordance with the Protection of Personal Information Act (POPIA):
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>You will only use the customer's information for the administration of your loyalty program.</li>
              <li>If you intend to send marketing communications (emails or SMS), you will only do so to customers who have willingly presented their QR code to you, establishing a business relationship.</li>
              <li>You agree not to sell, rent, or share the customer's personal information with any third parties.</li>
              <li>You must respect any customer's request to be removed from your loyalty program and cease all communications immediately.</li>
              <li>i-Loyalty acts purely as the platform provider and bears no liability for your misuse of customer data.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">4. Program Rules and Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Vendors have full control over the rules of their loyalty programs (e.g., maximum points, expiration dates, cooldown limits). i-Loyalty is not responsible for fulfilling the rewards promised by Vendors, nor are we liable for any disputes between a Vendor and a Customer regarding points or rewards.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">5. User Conduct</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree not to use i-Loyalty to engage in fraudulent activities, such as artificially inflating points or creating fake accounts. We reserve the right to suspend or terminate accounts that violate these terms or exhibit suspicious behavior.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">6. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by South African law, i-Loyalty shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">7. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of the app after such changes constitutes your acceptance of the new Terms.
            </p>
          </section>
        </article>
      ) : (
        <article className="prose prose-sm prose-orange">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to i-Loyalty. We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our application. We comply with the Protection of Personal Information Act (POPIA) of South Africa.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">2. Information We Collect</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li><strong>Account Information:</strong> We collect your name, email address, phone number, and authentication data.</li>
              <li><strong>Loyalty Data:</strong> We track loyalty points, scan history, reward redemptions, and the dates of your visits to participating vendors.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">3. How Your Data is Shared with Vendors</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              <strong>Explicit Consent:</strong> By presenting your unique i-Loyalty QR code to a Vendor to be scanned, you are providing your explicit consent to share your basic profile information (Name, Email, Phone Number) and visit history with that specific Vendor.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Vendors use this information to operate their loyalty program and may use it to send you relevant marketing communications. Vendors are contractually bound by our Terms and Conditions to protect your data under POPIA guidelines.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">4. How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Creating and managing your account.</li>
              <li>Facilitating the assignment and tracking of loyalty points.</li>
              <li>Providing necessary notifications (e.g., when you earn a reward).</li>
              <li>Improving the i-Loyalty platform.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">5. Data Sharing and Third Parties</h2>
            <p className="text-gray-600 leading-relaxed">
              Other than sharing your data with the specific Vendors you choose to scan your QR code with, we will not share your personal data with any other third parties for marketing, advertising, or unauthorized purposes.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">6. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              Under POPIA, you have the right to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Request access to the personal information we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Withdraw your consent to participate in specific vendor loyalty programs.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">8. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us.
            </p>
          </section>
        </article>
      )}
    </div>
  );
}
