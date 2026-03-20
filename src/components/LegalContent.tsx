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
              Welcome to Send My Task ("we", "our", or "us"). These Terms and Conditions govern your use of the Send My Task application and services. By accessing or using our app, you agree to be bound by these Terms. These Terms are governed by the laws of the Republic of South Africa.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">2. Account Registration and Usage</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              <strong>Task Creators:</strong> To create and send a task, you must register for an account using a valid email address or Google account. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Task Recipients:</strong> To receive, view, and complete a task, you do not need to create an account. You may access the task via the unique link provided by the task creator and complete it as a "Guest".
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">3. Privacy and Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We respect your privacy. Your personal data and task data will never be sold or shared with third parties for marketing or any other unauthorized purposes. For more details, please review our Privacy Policy.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">4. Task Sharing and Visibility</h2>
            <p className="text-gray-600 leading-relaxed">
              When a task is created, a unique link is generated. Please be aware that tasks sent to a recipient might be reshared by the recipient or the task creator. Anyone with access to the unique task link can view the task details and mark items as complete. You are responsible for the sensitivity of the information you include in your tasks.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">5. Data Retention and Account Deletion</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              <strong>Inactive Tasks:</strong> To maintain system performance, any task that remains completely inactive (no views, edits, or completions) for a period of over 12 months will be permanently deleted from our servers.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Account Deletion:</strong> If you choose to delete your account, your personal profile will be removed. However, to ensure that recipients do not lose access to tasks they are currently working on, tasks you have created will not be deleted. Instead, they will be anonymized, and the creator will be displayed as "Deleted User".
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">6. Subscriptions and Recurring Billing</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              Send My Task offers an Unlimited plan for users who require more capacity. By subscribing to the Unlimited plan, you agree to the following billing terms:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li><strong>Monthly Basis:</strong> Recurring billing is processed on a month-to-month basis.</li>
              <li><strong>Billing Cycle:</strong> Your next billing date will be on the same day of the following month. For example, if your first billing occurs on the 19th of March, your next billing will be on the 19th of April.</li>
              <li><strong>Pricing:</strong> We reserve the right to modify our pricing with prior notice to our users.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">7. Cancellation and Refund Policy</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              We strive to provide a transparent and fair service. Please take note of our cancellation and refund procedures:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li><strong>Cancellation Notice:</strong> Cancellation must be done at least 48 hours before your next billing date to ensure you are not charged for the following month.</li>
              <li><strong>Service After Cancellation:</strong> Once a plan is cancelled, a confirmation will be sent to your registered email. You will continue to have access to the Unlimited service until your next billing date, at which point the plan will officially terminate.</li>
              <li><strong>No Refunds:</strong> No refunds will be given for partial months or unused service. Refunds will only be considered if it can be ascertained that Send My Task wrongfully debited a user's account. In such cases, a bank statement may be required from the user in order to fulfil the refund request.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">8. User Conduct</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree not to use Send My Task to transmit any unlawful, harassing, defamatory, abusive, threatening, harmful, or otherwise objectionable material. We reserve the right to remove any content or terminate accounts that violate these terms.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">9. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by South African law, including the Consumer Protection Act (CPA), Send My Task shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">10. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any significant changes. Continued use of the app after such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms, please contact us through the support channels provided in the app.
            </p>
          </section>
        </article>
      ) : (
        <article className="prose prose-sm prose-orange">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to Send My Task ("we", "our", or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our application. We comply with the Protection of Personal Information Act (POPIA) of South Africa.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">2. Information We Collect</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li><strong>Account Information:</strong> When you sign up to create tasks, we collect your name, email address, and authentication data (such as Google sign-in details).</li>
              <li><strong>Task Data:</strong> We collect the content of the tasks you create, including titles, descriptions, checklists, due dates, and any comments or voice notes you attach.</li>
              <li><strong>Guest Information:</strong> To receive and complete a task, a receiver does not need to have an account. However, when a guest completes a task item, they may provide a name (e.g., "Guest") which is recorded alongside the completion timestamp.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              We use your information strictly to provide, maintain, and improve the Send My Task service. This includes:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Creating and managing your account.</li>
              <li>Processing your subscription and billing through our secure payment partner, Peach Payments.</li>
              <li>Storing and displaying your tasks to you and your designated recipients.</li>
              <li>Sending necessary notifications related to your tasks, billing, or account.</li>
              <li>Providing customer support.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">4. Data Sharing and Third Parties</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              We will not share your task data or personal data with third parties for marketing, advertising, or any other unauthorized purposes.
            </p>
            <p className="text-gray-600 leading-relaxed mb-2">
              <strong>Payment Processing:</strong> We use Peach Payments for secure payment processing. When you subscribe, your payment information is handled directly by Peach Payments. We do not store your credit card details on our servers.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Please be aware that tasks sent to a recipient might be reshared by the recipient or the task creator. Anyone who possesses the unique link to a task can view its contents. We are not responsible for the privacy of data you choose to include in a task that is subsequently shared by others.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">5. Data Retention and Deletion</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              <strong>Inactive Tasks:</strong> Any task that remains inactive (no views, edits, or completions) for a period of over 12 months will be permanently deleted from our systems to ensure data minimization.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Account Deletion:</strong> If you choose to delete your account, your personal profile data (name, email) will be removed from our active database. However, to preserve the integrity of tasks for recipients who may still be using them, the tasks you created will not be deleted. Instead, they will be anonymized, and the creator's email will be permanently changed to "Deleted User".
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
              <li>Request deletion of your account and personal data (subject to the anonymization of tasks as described above).</li>
              <li>Object to the processing of your personal information.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">8. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">9. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us through the support channels provided in the app.
            </p>
          </section>
        </article>
      )}
    </div>
  );
}
