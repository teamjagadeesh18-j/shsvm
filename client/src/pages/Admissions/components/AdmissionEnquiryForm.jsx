import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionPill from '../../../components/common/SectionPill/SectionPill';
import Reveal from '../../../components/common/Reveal/Reveal';
import PupilInfoFields from './PupilInfoFields';
import ParentAddressFields from './ParentAddressFields';
import AcademicHistoryFields from './AcademicHistoryFields';
import { validatePhoneNumber, validatePincode } from '../../../components/common/FormInputs/formValidation.js';
import { buildMessage, openWhatsApp } from '../../../services/whatsapp';

const INITIAL_FORM = {
  pupilName: '',
  dob: '',
  nationalityState: 'Indian / Tamil Nadu',
  religionCaste: '',
  motherTongue: '',
  secondLanguage: '',
  parentName: '',
  occupation: '',
  mobile: '',
  address: '',
  pincode: '',
  email: '',
  level: '',
  gradeClass: '',
  previousSchool: '',
  tcAvailable: 'Not applicable',
  message: '',
  consent: false
};

const TODAY_STR = new Date().toISOString().split('T')[0];

export default function AdmissionEnquiryForm({ levels = [], tcOptions = [] }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successUrl, setSuccessUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.pupilName.trim()) errs.pupilName = 'Pupil name is required';

    if (!form.dob) {
      errs.dob = 'Date of birth is required';
    } else {
      const selected = new Date(form.dob);
      const today = new Date();
      if (selected > today) {
        errs.dob = 'Date of birth cannot be in the future';
      }
    }

    if (!form.parentName.trim()) errs.parentName = 'Parent / Guardian name is required';

    const phoneErr = validatePhoneNumber(form.mobile, true);
    if (phoneErr) errs.mobile = phoneErr;

    if (form.pincode && form.pincode.trim()) {
      const pinErr = validatePincode(form.pincode, false);
      if (pinErr) errs.pincode = pinErr;
    }

    if (!form.address.trim()) errs.address = 'Full residential address is required';

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!form.level) errs.level = 'Please select a schooling level';
    if (!form.consent) errs.consent = 'You must agree to share details via WhatsApp';

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const targetEl = document.getElementById(firstField);
      if (targetEl) {
        targetEl.focus();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    const msg = buildMessage('admission', form);
    const result = openWhatsApp(msg);

    setSuccessUrl(result.url);
    setForm(INITIAL_FORM);
    setErrors({});
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <section className="admissions-form-section" id="enquiry-form">
      <div className="container">
        <Reveal>
          <div className="admissions-form-card">
            <div className="form-card-header">
              <SectionPill text={t('admissions.onlineSubmissionPill')} />
              <h2 className="form-card-title">{t('admissions.formTitle')}</h2>
              <p className="form-card-subtitle">{t('admissions.formSubtitle')}</p>
            </div>

            {successUrl && (
              <div className="form-success-banner" role="status" aria-live="polite">
                <span className="success-icon" aria-hidden="true">✓</span>
                <div className="success-text">
                  <strong>{t('admissions.successOpening')}{' '}</strong>
                  <a href={successUrl} target="_blank" rel="noopener noreferrer" className="success-link">
                    {t('admissions.tryAgain')} ↗
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="admission-enquiry-form">
              <PupilInfoFields
                form={form}
                errors={errors}
                handleChange={handleChange}
                todayStr={TODAY_STR}
              />

              <ParentAddressFields
                form={form}
                errors={errors}
                handleChange={handleChange}
              />

              <AcademicHistoryFields
                form={form}
                errors={errors}
                handleChange={handleChange}
                levels={levels}
                tcOptions={tcOptions}
              />

              {/* Consent & Submit Row */}
              <div className="form-footer-block">
                <div className="consent-check-wrap">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? 'consent-error' : undefined}
                  />
                  <label htmlFor="consent" className="consent-label">
                    {t('admissions.consentLabel')} <span className="req">*</span>
                  </label>
                </div>
                {errors.consent && (
                  <div id="consent-error" className="field-error-msg consent-error-msg">{errors.consent}</div>
                )}

                <div className="submit-action-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="whatsapp-submit-btn"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="whatsapp-official-icon">
                      <path
                        fill="#25D366"
                        d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"
                      />
                    </svg>
                    <span>{t('admissions.submitBtn')}</span>
                  </button>

                  <p className="submit-security-note">
                    {t('admissions.submitNote')}
                  </p>
                </div>
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
