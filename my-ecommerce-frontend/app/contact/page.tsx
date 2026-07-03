'use client';

import { useState } from 'react';
import MagneticButton from '@/components/MagneticButton';

export default function ContactPage() {
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual form submission
    setStatus('Message sent successfully! We will get back to you soon.');
    setTimeout(() => setStatus(''), 5000);
  };

  return (
    <div className="bg-brand-bg min-h-screen text-brand-text pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 text-center">Contact Us</h1>
        <p className="text-center text-brand-text/80 mb-12 max-w-xl mx-auto">
          We would love to hear from you. Whether you have a question about our products, need assistance with an order, or just want to share your Slay By Humu experience, our team is here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-sm tracking-[0.2em] font-bold text-brand-accent uppercase mb-2">Email</h3>
              <p className="text-brand-text/80">support@slaybyhumu.com</p>
            </div>
            <div>
              <h3 className="text-sm tracking-[0.2em] font-bold text-brand-accent uppercase mb-2">Business Hours</h3>
              <p className="text-brand-text/80">Monday - Friday: 9:00 AM - 6:00 PM (GMT)</p>
              <p className="text-brand-text/80">Saturday - Sunday: Closed</p>
            </div>
            <div>
              <h3 className="text-sm tracking-[0.2em] font-bold text-brand-accent uppercase mb-2">Social Media</h3>
              <p className="text-brand-text/80">Follow us on Instagram: @slaybyhumu</p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-brand-text/80 mb-2">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  className="w-full bg-transparent border border-brand-text/20 text-brand-text px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-brand-text/80 mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  className="w-full bg-transparent border border-brand-text/20 text-brand-text px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-brand-text/80 mb-2">Message</label>
                <textarea 
                  id="message" 
                  rows={5}
                  required
                  className="w-full bg-transparent border border-brand-text/20 text-brand-text px-4 py-3 focus:outline-none focus:border-brand-accent transition-colors resize-none"
                ></textarea>
              </div>
              {status && (
                <p className="text-green-500 text-sm">{status}</p>
              )}
              <MagneticButton>
                <button type="submit" className="bg-brand-accent hover:bg-[var(--color-brand-accent-hover)] text-white text-xs font-bold tracking-widest uppercase px-8 py-4 transition-colors w-full">
                  Send Message
                </button>
              </MagneticButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
