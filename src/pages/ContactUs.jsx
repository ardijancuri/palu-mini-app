import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-us">
      <div className="contact-us-content">
        <div className="contact-header">
          <h1 className="contact-title">Contact Us</h1>
          <div className="contact-description">
            <p>Get in touch with the PALU team. We'd love to hear from you!</p>
          </div>
        </div>
        
        <div className="contact-main">
          <div className="social-media-section">
            <h2 className="section-title">Follow Us</h2>
            <div className="social-links">
              <a href="https://x.com/palubsc" className="social-link twitter" target="_blank" rel="noopener noreferrer">
                <div className="social-icon">
                  <i className="fab fa-twitter"></i>
                </div>
                <div className="social-info">
                  <h3>X (Twitter)</h3>
                  <p>Follow us for updates</p>
                  <span className="social-handle">@palubsc</span>
                </div>
              </a>
              
              <a href="https://t.me/palubsc" className="social-link telegram" target="_blank" rel="noopener noreferrer">
                <div className="social-icon">
                  <i className="fab fa-telegram"></i>
                </div>
                <div className="social-info">
                  <h3>Telegram</h3>
                  <p>Join our community</p>
                  <span className="social-handle">@palubsc</span>
                </div>
              </a>
            </div>
            
            <div className="contact-info">
              <h3>Other Ways to Reach Us</h3>
              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <span>contact@palu.meme</span>
              </div>
              <div className="info-item">
                <i className="fas fa-globe"></i>
                <span>bnb.palu.meme</span>
              </div>
            </div>
          </div>
          
          <div className="contact-form-section">
            <h2 className="section-title">Send us a Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What's this about?"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us more..."
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
