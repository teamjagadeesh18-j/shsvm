import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from '../../../components/common/FormInputs/PhoneInput';
import NumericInput from '../../../components/common/FormInputs/NumericInput';

export default function ParentAddressFields({ form, errors, handleChange }) {
  const { t } = useTranslation();

  return (
    <div className="form-group-block">
      <div className="form-group-badge">{t('admissions.group2Title')}</div>
      <div className="form-grid-3">
        <div className="form-field">
          <label htmlFor="parentName">
            {t('admissions.parentNameLabel')} <span className="req">*</span>
          </label>
          <input
            type="text"
            id="parentName"
            name="parentName"
            value={form.parentName}
            onChange={handleChange}
            placeholder="Father / Mother / Guardian"
            aria-invalid={!!errors.parentName}
            aria-describedby={errors.parentName ? 'parentName-error' : undefined}
            className={errors.parentName ? 'input-error' : ''}
          />
          {errors.parentName && (
            <span id="parentName-error" className="field-error-msg">{errors.parentName}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="occupation">{t('admissions.occupationLabel')}</label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            placeholder="e.g. Business / Service"
          />
        </div>

        <div className="form-field">
          <PhoneInput
            id="mobile"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            label={t('admissions.mobileLabel')}
            required={true}
            error={errors.mobile}
            placeholder="98765 43210"
          />
        </div>

        <div className="form-field span-2">
          <label htmlFor="address">
            {t('admissions.addressLabel')} <span className="req">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Door no, street, area, town"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? 'address-error' : undefined}
            className={errors.address ? 'input-error' : ''}
          />
          {errors.address && (
            <span id="address-error" className="field-error-msg">{errors.address}</span>
          )}
        </div>

        <div className="form-field">
          <NumericInput
            id="pincode"
            name="pincode"
            value={form.pincode || ''}
            onChange={handleChange}
            label="Postal Pincode"
            hint="(6 digits)"
            maxLength={6}
            disallowLeadingZero={true}
            placeholder="602024"
            error={errors.pincode}
            required={false}
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">{t('admissions.emailLabel')}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Optional email address"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && (
            <span id="email-error" className="field-error-msg">{errors.email}</span>
          )}
        </div>
      </div>
    </div>
  );
}
