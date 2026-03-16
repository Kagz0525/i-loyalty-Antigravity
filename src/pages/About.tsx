export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About LoyaltyMVP</h1>
        <div className="prose prose-orange max-w-none text-gray-600">
          <p className="text-lg mb-4">
            Welcome to LoyaltyMVP, the simplest way to manage and track loyalty points for your favorite local businesses.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">For Customers</h2>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Keep all your loyalty cards in one digital wallet.</li>
            <li>Never lose a stamp card again.</li>
            <li>Easily track your progress towards free rewards.</li>
            <li>Quickly scan your unique QR code at checkout.</li>
          </ul>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">For Vendors</h2>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Modernize your loyalty program without expensive hardware.</li>
            <li>Manage your customer base easily.</li>
            <li>Add points with a single tap.</li>
            <li>Build stronger relationships with your regulars.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
