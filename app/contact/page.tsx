
'use client';

import Header from '../../components/Header';
import ContactForm from '../../components/ContactForm';
import { useState, useEffect } from 'react';

export default function ContactPage() {
  const [userType, setUserType] = useState('');
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: 'What are your operating hours?',
      answer: 'We are open daily from 9:00 AM to 10:00 PM, including weekends and holidays.',
      isActive: true
    },
    {
      id: 2,
      question: 'Do you offer delivery services?',
      answer: 'Yes, we offer delivery within Pokhara city limits. Free delivery for orders above ₨500, otherwise ₨50 delivery charge applies.',
      isActive: true
    },
    {
      id: 3,
      question: 'What payment methods do you accept?',
      answer: 'We currently accept cash on delivery only. No credit cards or digital payments are required.',
      isActive: true
    },
    {
      id: 4,
      question: 'Do you have vegetarian options?',
      answer: 'Yes, we have many vegetarian dishes including vegetable momos, dal bhat, and various traditional Newari vegetarian items.',
      isActive: true
    },
    {
      id: 5,
      question: 'Can I make table reservations?',
      answer: 'Yes, you can make reservations by calling us. We recommend booking in advance, especially during peak hours.',
      isActive: true
    }
  ]);
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Newari Bhatti and Kathmandu Momo Ghar',
    phone: '+977-61-523456',
    email: 'info@newaribhatti.com',
    address: 'Nadipur, Pokhara 33700, Nepal',
    coordinates: '28.22886241546525, 83.99098268394296'
  });

  useEffect(() => {
    const userTypeStored = localStorage.getItem('userType') || 'user';
    setUserType(userTypeStored);

    // Load restaurant info
    const savedInfo = JSON.parse(localStorage.getItem('restaurantInfo') || 'null');
    if (savedInfo) {
      setRestaurantInfo(savedInfo);
    }

    // Load FAQs
    const savedFaqs = JSON.parse(localStorage.getItem('restaurantFaqs') || 'null');
    if (savedFaqs) {
      setFaqs(savedFaqs);
    } else {
      localStorage.setItem('restaurantFaqs', JSON.stringify(faqs));
    }
  }, []);

  const addFaq = (faqData: { question: string; answer: string }) => {
    const newFaq = {
      id: Date.now(),
      ...faqData,
      isActive: true
    };
    const updatedFaqs = [...faqs, newFaq];
    setFaqs(updatedFaqs);
    localStorage.setItem('restaurantFaqs', JSON.stringify(updatedFaqs));
    setShowAddFaqModal(false);
  };

  const updateFaq = (id: number, faqData: { question: string; answer: string }) => {
    const updatedFaqs = faqs.map(faq => 
      faq.id === id ? { ...faq, ...faqData } : faq
    );
    setFaqs(updatedFaqs);
    localStorage.setItem('restaurantFaqs', JSON.stringify(updatedFaqs));
    setEditingFaq(null);
  };

  const deleteFaq = (id: number) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      const updatedFaqs = faqs.filter(faq => faq.id !== id);
      setFaqs(updatedFaqs);
      localStorage.setItem('restaurantFaqs', JSON.stringify(updatedFaqs));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Contact Us</h1>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-restaurant-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Restaurant Name</h3>
                    <p className="text-gray-600">{restaurantInfo.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-map-pin-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                    <p className="text-gray-600">{restaurantInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-phone-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                    <a href={`tel:${restaurantInfo.phone}`} className="text-orange-600 hover:text-orange-700 cursor-pointer">
                      {restaurantInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-mail-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                    <a href={`mailto:${restaurantInfo.email}`} className="text-orange-600 hover:text-orange-700 cursor-pointer">
                      {restaurantInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-time-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Operating Hours</h3>
                    <p className="text-gray-600">Daily: 9:00 AM - 10:00 PM</p>
                    <p className="text-sm text-gray-500">Open all week including holidays</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send us a Message</h2>
              <ContactForm />
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Find Us</h2>
            <div className="aspect-video rounded-lg overflow-hidden cursor-pointer" 
                 onClick={() => window.open(`https://www.google.com/maps/place/${restaurantInfo.coordinates}`, '_blank')}>
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d219.70586196168153!2d83.9908873!3d28.2287612!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399595c315c578db%3A0x4c21b4257a106489!2sNewari%20Bhatti%20and%20Kathmandu%20momo%20ghar!5e0!3m2!1sen!2snp!4v1757060425626!5m2!1sen!2snp`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Newari Bhatti & Kathmandu Momo Ghar Location"
              ></iframe>
            </div>
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <p className="text-orange-700 text-sm">
                <i className="ri-cursor-line mr-2"></i>
                Click on the map to open in Google Maps for directions
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Frequently Asked Questions</h2>
              {(userType === 'admin' || userType === 'superadmin') && (
                <button
                  onClick={() => setShowAddFaqModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap text-sm"
                >
                  Add FAQ
                </button>
              )}
            </div>

            <div className="space-y-4">
              {faqs.filter(faq => faq.isActive).map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                    {(userType === 'admin' || userType === 'superadmin') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingFaq(faq)}
                          className="text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => deleteFaq(faq.id)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add FAQ Modal */}
          {showAddFaqModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Add New FAQ</h3>
                  <button
                    onClick={() => setShowAddFaqModal(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  addFaq({
                    question: formData.get('question') as string,
                    answer: formData.get('answer') as string
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                    <input
                      type="text"
                      name="question"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                    <textarea
                      name="answer"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddFaqModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                    >
                      Add FAQ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit FAQ Modal */}
          {editingFaq && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Edit FAQ</h3>
                  <button
                    onClick={() => setEditingFaq(null)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  updateFaq(editingFaq.id, {
                    question: formData.get('question') as string,
                    answer: formData.get('answer') as string
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                    <input
                      type="text"
                      name="question"
                      defaultValue={editingFaq.question}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                    <textarea
                      name="answer"
                      defaultValue={editingFaq.answer}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingFaq(null)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                    >
                      Update FAQ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
