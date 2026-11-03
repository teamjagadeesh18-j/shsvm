import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from '../FormInputs/PhoneInput';
import { validatePhoneNumber } from '../FormInputs/formValidation.js';
import { buildMessage, openWhatsApp } from '../../../services/whatsapp';

/**
 * Reusable EnquiryForm Component
 * Sends structured message directly via WhatsApp with digits-only phone input.
 */
export default function EnquiryForm({
  formName = 'General Enquiry',
  showSubject = false,
  showGrade = true,
  showDob = false,
  showNotes = true,
  buttonText,
  onSuccess,
  className = ''
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    parentName: '', studentName: '', dob: '', grade: '', phone: '', email: '',
    subject: 'General Admission Enquiry', notes: '', consent: false
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.parentName.trim()) errs.parentName = 'Parent / Guardian name is required';
    if (!formData.studentName.trim()) errs.studentName = 'Student name is required';
    if (showGrade && !formData.grade) errs.grade = 'Please select a school level / grade';
    const phoneErr = validatePhoneNumber(formData.phone, true);
    if (phoneErr) errs.phone = phoneErr;
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.consent) errs.consent = t('validation.consentRequired', 'You must agree to share details via WhatsApp');
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const targetEl = document.getElementById(`ef-${firstField}`);
      if (targetEl) {
        targetEl.focus();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);
    const msg = buildMessage('enquiry', { ...formData, formTitle: formName });
    const { url } = openWhatsApp(msg);

    setFallbackUrl(url);
    if (onSuccess) onSuccess(formData);
    setTimeout(() => setSubmitting(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`enquiry-form-wrap ${className}`}>
      {fallbackUrl && (
        <div className="form-success-banner" role="status" aria-live="polite" style={{ marginBottom: 16 }}>
          <span className="success-icon" aria-hidden="true">✓</span>
          <div className="success-text">
            <strong>{t('validation.successOpening', 'Opening WhatsApp...')} </strong>
            <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="success-link">
              {t('validation.tapToTry', 'Tap here if it didn\'t open')} ↗
            </a>
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="ef-parentName">
          {t('formParentName') || 'Parent / Guardian Full Name'} *
        </label>
        <input
          type="text"
          id="ef-parentName"
          name="parentName"
          value={formData.parentName}
          onChange={handleChange}
          className={`form-control ${errors.parentName ? 'input-error' : ''}`}
          placeholder="e.g. S. Rajendran"
          aria-invalid={!!errors.parentName}
        />
        {errors.parentName && <span className="field-error-msg">{errors.parentName}</span>}
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="ef-studentName">
            {t('formStudentName') || 'Student Name'} *
          </label>
          <input
            type="text"
            id="ef-studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className={`form-control ${errors.studentName ? 'input-error' : ''}`}
            placeholder="e.g. R. Ananya"
            aria-invalid={!!errors.studentName}
          />
          {errors.studentName && <span className="field-error-msg">{errors.studentName}</span>}
        </div>

        {showDob && (
          <div className="form-group">
            <label className="form-label" htmlFor="ef-dob">Date of Birth *</label>
            <input type="date" id="ef-dob" name="dob" value={formData.dob} onChange={handleChange} className="form-control" />
          </div>
        )}

        {showGrade && (
          <div className="form-group">
            <label className="form-label" htmlFor="ef-grade">
              {t('formGrade') || 'Applying For Level / Grade'} *
            </label>
            <select
              id="ef-grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className={`form-control ${errors.grade ? 'input-error' : ''}`}
              aria-invalid={!!errors.grade}
            >
              <option value="">Select School Level / Grade</option>
              {['Primary - Grade 1', 'Primary - Grade 2', 'Primary - Grade 3', 'Primary - Grade 4', 'Primary - Grade 5',
                'Upper Primary - Grade 6', 'Upper Primary - Grade 7', 'Upper Primary - Grade 8',
                'Secondary - Grade 9', 'Secondary - Grade 10'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors.grade && <span className="field-error-msg">{errors.grade}</span>}
          </div>
        )}
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <PhoneInput
            id="ef-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            label={t('formPhone') || 'Contact Phone Number'}
            required={true}
            error={errors.phone}
            placeholder="98765 43210"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ef-email">Email Address (Optional)</label>
          <input
            type="email"
            id="ef-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-control ${errors.email ? 'input-error' : ''}`}
            placeholder="parent@domain.com"
          />
          {errors.email && <span className="field-error-msg">{errors.email}</span>}
        </div>
      </div>

      {showSubject && (
        <div className="form-group">
          <label className="form-label" htmlFor="ef-subject">Subject</label>
          <input type="text" id="ef-subject" name="subject" value={formData.subject} onChange={handleChange} className="form-control" />
        </div>
      )}

      {showNotes && (
        <div className="form-group">
          <label className="form-label" htmlFor="ef-notes">Questions / Special Requests</label>
          <textarea
            id="ef-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="form-control"
            placeholder="Any specific questions about admission, curriculum, or school timings..."
          />
        </div>
      )}

      <div className="form-group" style={{ marginTop: 12 }}>
        <label className="consent-checkbox-label" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            id="ef-consent"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0, cursor: 'pointer' }}
          />
          <span>{t('validation.consentText', 'I agree to share these details with the school through WhatsApp.')} <span className="req" style={{ color: 'var(--color-accent)' }}>*</span></span>
        </label>
        {errors.consent && <div className="field-error-msg" style={{ marginTop: 4 }}>{errors.consent}</div>}
      </div>

      <button type="submit" className="whatsapp-submit-btn" style={{ width: '100%', marginTop: '12px' }} disabled={submitting}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="whatsapp-official-icon">
          <path fill="#25D366" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
          <path fill="#FFFFFF" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
        </svg>
        <span>{submitting ? (t('formSubmitting') || 'Sending...') : (buttonText || t('admissions.submitBtn') || 'Send Enquiry via WhatsApp')}</span>
      </button>
    </form>
  );
}
