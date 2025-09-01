'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare form data using application/x-www-form-urlencoded encoding
      const submitData = new URLSearchParams();
      submitData.append('name', formData.name.trim());
      submitData.append('email', formData.email.trim());
      submitData.append('phone', formData.phone.trim());
      // For dropdown - get the selected content only
      submitData.append('subject', formData.subject || 'General Inquiry');
      submitData.append('message', formData.message.trim());

      // Submit to specified endpoint
      const response = await fetch('https://readdy.ai/api/form/d2o4gpqk0nafr2t3j6bg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: submitData.toString()
      });

      if (response.ok) {
        // Clear form data
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setSubmitStatus('success');
        setTimeout(() => setSubmitStatus(''), 5000);
        
        // Also store locally for demonstration
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const newMessage = {
          id: Date.now(),
          ...formData,
          date: new Date().toISOString(),
          status: 'new'
        };
        messages.push(newMessage);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {submitStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <i className="ri-check-line text-green-600"></i>
            <p className="text-green-800 font-medium">Message sent successfully!</p>
          </div>
          <p className="text-green-700 text-sm mt-1">We'll get back to you within 24 hours.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <i className="ri-error-warning-line text-red-600"></i>
            <p className="text-red-800 font-medium">Please fill in all required fields.</p>
          </div>
        </div>
      )}

      <form id="contact-form" data-readdy-form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter your full name"
            maxLength={50}
            required
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter your email address"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="+977-XXXXXXXXXX"
            maxLength={20}
          />
        </div>

        <div>
          <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <select
            id="contact-subject"
            name="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
          >
            <option value="">Select a subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Table Reservation">Table Reservation</option>
            <option value="Catering Services">Catering Services</option>
            <option value="Feedback">Feedback</option>
            <option value="Complaint">Complaint</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setFormData(prev => ({ ...prev, message: e.target.value }));
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            placeholder="Tell us how we can help you..."
            rows={5}
            maxLength={500}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.message.length}/500 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || formData.message.length > 500}
          className={`w-full py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            isSubmitting || formData.message.length > 500
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </div>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
}