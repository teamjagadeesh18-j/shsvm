import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from '../../../components/common/FormInputs/PhoneInput';
import { validatePhoneNumber } from '../../../components/common/FormInputs/formValidation.js';
import { buildMessage, openWhatsApp } from '../../../services/whatsapp';
import Icon from '../../../components/common/Icon/Icon';

/**
 * ContactForm Component
 * Message submission form for general enquiries on Contact page.
 * Sends directly to WhatsApp with digits-only phone validation and popup fallback.
 */
export default function ContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Admission Enquiry',
    message: '',
    consent: false
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneBlur = () => {
    const phoneErr = validatePhoneNumber(formData.phone, true);
    if (phoneErr) {
      setErrors((prev) => ({ ...prev, phone: phoneErr }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired') || 'Please enter your name';
    }

    const phoneErr = validatePhoneNumber(formData.phone, true);
    if (phoneErr) {
      newErrors.phone = phoneErr;
    }

    if (!formData.message.trim()) {
      newErrors.message = t('validation.messageRequired') || 'Please enter your message';
    }

    if (!formData.consent) {
      newErrors.consent = t('validation.consentRequired') || 'Please agree to proceed via WhatsApp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = ['name', 'phone', 'message', 'consent'].find((k) => newErrors[k]);
      if (firstField) {
        const el = document.getElementById(`cf-${firstField}`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setSubmitting(true);
    const message = buildMessage('contact', formData);
    const result = openWhatsApp(message);
    setFallbackUrl(result.url);
    setSubmitted(true);

    // Reset fields after successful dispatch
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: 'Admission Enquiry',
      message: '',
      consent: false
    });

    // Re-enable submit button after 4 seconds
    setTimeout(() => {
      setSubmitting(false);
    }, 4000);
  };

  return (
    <div className="contact-form-panel">
      <div className="tag-pill" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent-glow)' }}>
        ENQUIRY DESK
      </div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', color: 'var(--color-white)', marginBottom: '12px' }}>
        Send Us a Message
      </h2>
      <p style={{ color: 'var(--color-gray-muted)', marginBottom: '28px', fontSize: '0.9375rem' }}>
        Whether you are a prospective parent or community member, our administrative team will respond promptly.
      </p>

      {submitted ? (
        <div className="modal-success-state" style={{ color: 'var(--color-white)' }}>
          <div className="modal-success-icon" style={{ marginBottom: '16px' }}>
            <Icon name="whatsapp" size={40} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
            {t('validation.successOpening')}
          </h3>
          <p style={{ color: 'var(--color-gray-muted)', marginTop: '8px', lineHeight: '1.6' }}>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#25D366', fontWeight: 700, textDecoration: 'underline' }}
            >
              {t('validation.tapToTry')} ↗
            </a>
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="btn-pill btn-pill-outline"
            style={{ marginTop: '20px' }}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="cf-name">
              Full Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              id="cf-name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className={`form-control ${errors.name ? 'has-error' : ''}`}
              placeholder="Your full name"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'cf-name-error' : undefined}
            />
            {errors.name && (
              <div id="cf-name-error" className="field-error-msg" style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '4px' }}>
                {errors.name}
              </div>
            )}
          </div>

          <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Phone (PhoneInput with digits-only & +91 prefix) */}
            <PhoneInput
              id="cf-phone"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              onBlur={handlePhoneBlur}
              error={errors.phone}
              label="Phone Number"
              required={true}
              placeholder="89394 21231"
            />

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="cf-email">
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="cf-email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="form-control"
                placeholder="name@domain.com"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="cf-subject">
              Subject <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="cf-subject"
              name="subject"
              value={formData.subject}
              onChange={handleFormChange}
              className="form-control"
              required
            >
              <option value="Admission Enquiry">Admission Enquiry (Primary, Upper Primary, Secondary)</option>
              <option value="General Enquiry">General School Enquiry</option>
              <option value="Campus Visit">Campus Visit Booking</option>
              <option value="Alumni Connection">Alumni Registry</option>
              <option value="Careers">Teaching Opportunities</option>
              <option value="Other">Other Enquiry</option>
            </select>
          </div>

          {/* Message */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" htmlFor="cf-message">
              Message / Note <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="cf-message"
              name="message"
              value={formData.message}
              onChange={handleFormChange}
              rows="4"
              className={`form-control ${errors.message ? 'has-error' : ''}`}
              placeholder="How can our admissions and administrative team assist you?"
              required
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'cf-message-error' : undefined}
            />
            {errors.message && (
              <div id="cf-message-error" className="field-error-msg" style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '4px' }}>
                {errors.message}
              </div>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-white-a85)' }}>
              <input
                type="checkbox"
                id="cf-consent"
                name="consent"
                checked={formData.consent}
                onChange={handleFormChange}
                style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#25D366' }}
              />
              <span>
                {t('validation.consentRequired') ? t('admissions.consentLabel') : 'I agree to share these details with the school through WhatsApp.'}{' '}
                <span style={{ color: '#dc2626' }}>*</span>
              </span>
            </label>
            {errors.consent && (
              <div id="cf-consent-error" className="field-error-msg" style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '4px' }}>
                {errors.consent}
              </div>
            )}
          </div>

          {/* Submit Button & Subtext */}
          <button
            type="submit"
            className="whatsapp-submit-btn"
            style={{ width: '100%', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '9999px', background: '#000000', color: '#ffffff', border: '1px solid #333', fontWeight: 700, cursor: 'pointer' }}
            disabled={submitting}
          >
            <Icon name="whatsapp" size={22} />
            <span>{submitting ? 'Connecting...' : (t('validation.submitBtn') || 'Send via WhatsApp')}</span>
          </button>

          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-muted)', marginTop: '12px', textAlign: 'center', lineHeight: '1.4' }}>
            {t('validation.submitNote')}
          </p>
        </form>
      )}
    </div>
  );
}
