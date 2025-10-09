import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, MapPin, X } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { supportAPI } from '../services/api';

const SupportModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('contact');
  const [faqs, setFaqs] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [contactForm, setContactForm] = useState({
    type: 'whatsapp',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadFAQs();
    loadContactInfo();
  }, []);

  const loadFAQs = async () => {
    try {
      const response = await supportAPI.getFAQ();
      if (response.data.success) {
        setFaqs(response.data.data.faqs);
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
    }
  };

  const loadContactInfo = async () => {
    try {
      const response = await supportAPI.getContactInfo();
      if (response.data.success) {
        setContactInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await supportAPI.submitContact(contactForm);
      if (response.data.success) {
        setSubmitted(true);
        setContactForm({ type: 'whatsapp', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (contactInfo?.whatsapp) {
      const message = encodeURIComponent(contactInfo.whatsapp.message);
      window.open(`https://wa.me/${contactInfo.whatsapp.number.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (contactInfo?.phone) {
      window.open(`tel:${contactInfo.phone.number}`, '_self');
    }
  };

  const handleEmailClick = () => {
    if (contactInfo?.email) {
      window.open(`mailto:${contactInfo.email.address}`, '_self');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Support Center</h2>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Us
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'faq'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
        </div>

        {activeTab === 'contact' && (
          <div className="space-y-6">
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">Thank you! Your message has been submitted successfully.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={handleWhatsAppClick}>
                <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                <p className="text-sm text-gray-600 mb-2">{contactInfo?.whatsapp?.number}</p>
                <p className="text-xs text-gray-500">Quick response</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={handlePhoneClick}>
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Phone Call</h3>
                <p className="text-sm text-gray-600 mb-2">{contactInfo?.phone?.number}</p>
                <p className="text-xs text-gray-500">{contactInfo?.phone?.hours}</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={handleEmailClick}>
                <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-sm text-gray-600 mb-2">{contactInfo?.email?.address}</p>
                <p className="text-xs text-gray-500">{contactInfo?.email?.responseTime}</p>
              </Card>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Send us a message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Type
                  </label>
                  <select
                    value={contactForm.type}
                    onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Enter subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Enter your message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.id} className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {faq.category}
                </span>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SupportModal;
