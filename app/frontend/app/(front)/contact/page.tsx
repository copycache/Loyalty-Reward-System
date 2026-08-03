"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const validateAndSend = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name || !form.email || !form.message) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!emailRegex.test(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    const to = encodeURIComponent("iqonelitecorporation@gmail.com");
    const su = encodeURIComponent(form.subject || "(No Subject)");
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`,
      "_blank"
    );
  };

  return (
    <div className="contact-section-container">
      <section className="contact-section section">
        <div className="contact-container">
          <h1>Contact Us</h1>
          <p>Connect with us to start your journey toward success.</p>
          <div className="container">
            <div className="row">
              <div className="col-lg-4 col-md-12">
                <div className="contact-information-box-3">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="single-contact-info-box">
                        <div className="contact-info">
                          <h6><i className="fa fa-map-marker"></i> Address:</h6>
                          <p>BAGUIO CITY, BENGUET</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="single-contact-info-box">
                        <div className="contact-info">
                          <h6><i className="fa fa-phone"></i> Phone:</h6>
                          <p>+639977110055</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="single-contact-info-box">
                        <div className="contact-info">
                          <h6><i className="fa fa-facebook"></i> Facebook:</h6>
                          <a href="https://facebook.com/iqonelitecorporation" target="_blank" rel="noopener noreferrer">
                            <p>iQON ELITE Corporation</p>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="single-contact-info-box">
                        <div className="contact-info">
                          <h6><i className="fa fa-envelope"></i> Email:</h6>
                          <p>iqonelitecorporation@gmail.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-8 col-md-12">
                <div className="contact-form-box">
                  <div className="form-container-box">
                    <form onSubmit={validateAndSend}>
                      <div className="controls">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group form-input-box">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Name *"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group form-input-box">
                              <input
                                type="email"
                                className="form-control"
                                placeholder="Email *"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="form-group form-input-box">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Subject"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-group form-input-box">
                              <textarea
                                className="form-control"
                                rows={7}
                                placeholder="Write Your Message *"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                required
                              ></textarea>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <button type="submit" className="send-message-button">
                              Send Message
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .contact-section-container {
          font-family: 'Inter', sans-serif;
        }

        .contact-section {
          padding: 60px 0;
        }

        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }

        .contact-container h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 10px;
          text-align: center;
        }

        .contact-container > p {
          text-align: center;
          margin-bottom: 40px;
          color: #666;
        }

        .container {
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -15px;
          margin-left: -15px;
        }

        .col-lg-4, .col-lg-8, .col-lg-12, .col-md-6, .col-md-12, .col-12 {
          position: relative;
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
        }

        .col-lg-4 {
          flex: 0 0 33.333333%;
          max-width: 33.333333%;
        }

        .col-lg-8 {
          flex: 0 0 66.666667%;
          max-width: 66.666667%;
        }

        .col-lg-12 {
          flex: 0 0 100%;
          max-width: 100%;
        }

        .col-md-6 {
          flex: 0 0 50%;
          max-width: 50%;
        }

        .col-md-12 {
          flex: 0 0 100%;
          max-width: 100%;
        }

        @media (max-width: 992px) {
          .col-lg-4, .col-lg-8 {
            flex: 0 0 100%;
            max-width: 100%;
          }
        }

        .contact-information-box-3 {
          padding: 20px;
          background: #fff;
          border: 1px solid #e0e0e0;
          margin-bottom: 30px;
        }

        .single-contact-info-box {
          margin-bottom: 20px;
        }

        .contact-info h6 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 5px;
          color: var(--primary-color);
        }

        .contact-info p {
          margin: 0;
          color: #333;
          font-size: 0.95rem;
        }

        .contact-info a {
          color: #333;
          text-decoration: none;
        }

        .contact-info a:hover {
          color: var(--primary-color);
        }

        .contact-form-box {
          background: #fff;
          border: 1px solid #e0e0e0;
          padding: 30px;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-control {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #495057;
          background-color: #fff;
          border: 1px solid #ced4da;
          border-radius: 0;
          transition: border-color 0.15s ease-in-out;
        }

        textarea.form-control {
          height: auto;
          resize: vertical;
        }

        .send-message-button {
          background-color: var(--color-3);
          border: 1px solid var(--color-3);
          color: #000;
          padding: 12px 40px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          font-size: 1rem;
        }

        .send-message-button:hover {
          color: var(--color-3);
          background-color: transparent;
          border: 1px solid var(--color-3);
        }
      `}</style>
    </div>
  );
}
