import { Mail, MessageCircle, Twitter, Github, Send, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

interface ContactProps {
  isDark: boolean;
}

export function Contact({ isDark }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-4xl tracking-tight mb-2 transition-colors duration-500 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Contact Us
        </h1>
        <p className={`transition-colors duration-500 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Get in touch with our team for support, partnerships, or general inquiries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className={`rounded-3xl backdrop-blur-xl border p-8 transition-colors duration-500 ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white/50 border-white/60'
          }`}>
            {submitted ? (
              <div className="py-12 text-center">
                <div className={`inline-flex p-4 rounded-2xl mb-6 transition-colors duration-500 ${
                  isDark
                    ? 'bg-green-500/20'
                    : 'bg-green-100'
                }`}>
                  <Send className={`w-8 h-8 transition-colors duration-500 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <h3 className={`text-2xl tracking-tight mb-3 transition-colors duration-500 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Message Sent!
                </h3>
                <p className={`transition-colors duration-500 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className={`block text-sm mb-2 transition-colors duration-500 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-500 focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-cyan-500/50'
                          : 'bg-white/60 border-white/60 text-gray-900 placeholder-gray-500 focus:ring-cyan-500/50'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm mb-2 transition-colors duration-500 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-500 focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-cyan-500/50'
                          : 'bg-white/60 border-white/60 text-gray-900 placeholder-gray-500 focus:ring-cyan-500/50'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className={`block text-sm mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-500 focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white focus:ring-cyan-500/50'
                        : 'bg-white/60 border-white/60 text-gray-900 focus:ring-cyan-500/50'
                    }`}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="security">Security Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className={`block text-sm mb-2 transition-colors duration-500 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-500 focus:outline-none focus:ring-2 resize-none ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-cyan-500/50'
                        : 'bg-white/60 border-white/60 text-gray-900 placeholder-gray-500 focus:ring-cyan-500/50'
                    }`}
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-4 rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 hover:border-cyan-400/60 text-white hover:shadow-lg hover:shadow-cyan-500/20'
                      : 'bg-gradient-to-r from-cyan-100 to-purple-100 border border-cyan-300/50 hover:border-cyan-400/70 text-gray-900 hover:shadow-lg hover:shadow-cyan-300/30'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          {/* Quick Contact */}
          <div className={`rounded-3xl backdrop-blur-xl border p-6 transition-colors duration-500 ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white/50 border-white/60'
          }`}>
            <h3 className={`text-xl tracking-tight mb-4 transition-colors duration-500 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Contact
            </h3>
            
            <div className="space-y-4">
              <a
                href="mailto:support@orbityield.io"
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-500 ${
                  isDark
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-white/60 text-gray-700'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors duration-500 ${
                  isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-sm transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Email
                  </div>
                  <div className="text-sm">support@orbityield.io</div>
                </div>
              </a>

              <a
                href="#"
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-500 ${
                  isDark
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-white/60 text-gray-700'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors duration-500 ${
                  isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                }`}>
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-sm transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Discord
                  </div>
                  <div className="text-sm">Join Community</div>
                </div>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className={`rounded-3xl backdrop-blur-xl border p-6 transition-colors duration-500 ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white/50 border-white/60'
          }`}>
            <h3 className={`text-xl tracking-tight mb-4 transition-colors duration-500 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Follow Us
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <a
                href="#"
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-500 ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                    : 'bg-white/60 hover:bg-white/80 text-gray-700'
                }`}
              >
                <Twitter className="w-4 h-4" />
                <span className="text-sm">Twitter</span>
              </a>
              
              <a
                href="#"
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-500 ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                    : 'bg-white/60 hover:bg-white/80 text-gray-700'
                }`}
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>

          {/* Office Hours */}
          <div className={`rounded-3xl backdrop-blur-xl border p-6 transition-colors duration-500 ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white/50 border-white/60'
          }`}>
            <h3 className={`text-xl tracking-tight mb-4 transition-colors duration-500 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Support Hours
            </h3>
            
            <div className="space-y-3">
              <div className={`flex items-start gap-3 transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Clock className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="text-sm">Monday - Friday</div>
                  <div className={`text-sm transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    9:00 AM - 6:00 PM UTC
                  </div>
                </div>
              </div>

              <div className={`flex items-start gap-3 transition-colors duration-500 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <MapPin className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="text-sm">Remote First</div>
                  <div className={`text-sm transition-colors duration-500 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Global Team
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
