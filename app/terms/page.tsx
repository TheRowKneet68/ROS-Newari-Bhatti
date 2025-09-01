'use client';

import Header from '../../components/Header';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/" className="text-orange-600 hover:text-orange-700 cursor-pointer">
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            <div>
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Newari Bhatti and Kathmandu Momo Ghar. These terms and conditions outline the rules and regulations for the use of our restaurant services and website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Restaurant Services</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>2.1 Dining Services:</strong> We provide traditional Newari cuisine and authentic Nepali food in our restaurant located in Nadipur, Pokhara.</p>
                <p><strong>2.2 Operating Hours:</strong> Daily from 9:00 AM to 10:00 PM, subject to change during holidays and special occasions.</p>
                <p><strong>2.3 Reservations:</strong> Table reservations are recommended and can be made by calling +977-61-523456.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Orders and Payment</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>3.1 Order Acceptance:</strong> All orders are subject to availability and acceptance by the restaurant.</p>
                <p><strong>3.2 Payment Method:</strong> We currently accept cash on delivery only. No credit card or digital payment required at this time.</p>
                <p><strong>3.3 Pricing:</strong> All prices are in Nepali Rupees (NPR) and include applicable taxes. Prices may change without notice.</p>
                <p><strong>3.4 Delivery:</strong> Free delivery for orders above ₨500 within Pokhara city limits. ₨50 delivery charge applies for orders below ₨500.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Food Safety and Quality</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>4.1 Food Safety:</strong> We follow strict food safety and hygiene standards in accordance with Nepal Food Safety Standards.</p>
                <p><strong>4.2 Allergens:</strong> Please inform us of any food allergies or dietary restrictions when placing your order.</p>
                <p><strong>4.3 Quality Guarantee:</strong> If you are not satisfied with your meal, please contact us within 30 minutes of delivery/service.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Cancellation and Refund Policy</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>5.1 Order Cancellation:</strong> Orders can be cancelled within 5 minutes of placement without charge.</p>
                <p><strong>5.2 Refunds:</strong> Refunds are provided only in cases of restaurant error or unavailable items. As we operate on cash on delivery, refunds will be processed on your next visit.</p>
                <p><strong>5.3 No-Show Policy:</strong> Customers who are unavailable for delivery after three attempts may be charged a service fee.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Customer Conduct</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>6.1 Respectful Behavior:</strong> Customers are expected to treat staff with respect and courtesy.</p>
                <p><strong>6.2 Property Respect:</strong> Customers are responsible for any damage to restaurant property during their visit.</p>
                <p><strong>6.3 Feedback:</strong> We welcome constructive feedback and reviews about our service and food quality.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Privacy and Data Protection</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>7.1 Information Collection:</strong> We collect basic contact information for order processing and customer service.</p>
                <p><strong>7.2 Data Usage:</strong> Customer information is used solely for service delivery and will not be shared with third parties.</p>
                <p><strong>7.3 Data Security:</strong> We implement reasonable security measures to protect customer information.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Liability and Disclaimers</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>8.1 Limited Liability:</strong> Our liability is limited to the cost of the meal or service provided.</p>
                <p><strong>8.2 Force Majeure:</strong> We are not liable for delays or cancellations due to circumstances beyond our control.</p>
                <p><strong>8.3 Health Conditions:</strong> Customers with specific health conditions should consult with our staff about food ingredients.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contact Information</h2>
              <div className="bg-orange-50 rounded-lg p-6">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Restaurant:</strong> Newari Bhatti and Kathmandu Momo Ghar
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> Nadipur, Pokhara 33700, Nepal (6XHR+G9X)
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong> <a href="tel:+977-61-523456" className="text-orange-600 hover:text-orange-700">+977-61-523456</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> <a href="mailto:info@newaribhatti.com" className="text-orange-600 hover:text-orange-700">info@newaribhatti.com</a>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 text-center">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/" 
              className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}