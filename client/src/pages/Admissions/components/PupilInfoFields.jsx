import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PupilInfoFields({ form, errors, handleChange, todayStr }) {
  const { t } = useTranslation();

  return (
    <div className="form-group-block">
      <div className="form-group-badge">{t('admissions.group1Title')}</div>
      <div className="form-grid-3">
        <div className="form-field">
          <label htmlFor="pupilName">
            {t('admissions.pupilNameLabel')} <span className="req">*</span>
          </label>
          <input
            type="text"
            id="pupilName"
            name="pupilName"
            value={form.pupilName}
            onChange={handleChange}
            placeholder="Full name of student"
            aria-invalid={!!errors.pupilName}
            aria-describedby={errors.pupilName ? 'pupilName-error' : undefined}
            className={errors.pupilName ? 'input-error' : ''}
          />
          {errors.pupilName && (
            <span id="pupilName-error" className="field-error-msg">{errors.pupilName}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="dob">
            {t('admissions.dobLabel')} <span className="req">*</span>
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            max={todayStr}
            value={form.dob}
            onChange={handleChange}
            aria-invalid={!!errors.dob}
            aria-describedby={errors.dob ? 'dob-error' : undefined}
            className={errors.dob ? 'input-error' : ''}
          />
          {errors.dob && (
            <span id="dob-error" className="field-error-msg">{errors.dob}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="nationalityState">{t('admissions.nationalityStateLabel')}</label>
          <input
            type="text"
            id="nationalityState"
            name="nationalityState"
            value={form.nationalityState}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="religionCaste">{t('admissions.religionCasteLabel')}</label>
          <input
            type="text"
            id="religionCaste"
            name="religionCaste"
            value={form.religionCaste}
            onChange={handleChange}
            placeholder="e.g. Hindu / BC"
          />
          <span className="field-helper-text">{t('admissions.religionCasteHelper')}</span>
        </div>

        <div className="form-field">
          <label htmlFor="motherTongue">{t('admissions.motherTongueLabel')}</label>
          <input
            type="text"
            id="motherTongue"
            name="motherTongue"
            value={form.motherTongue}
            onChange={handleChange}
            placeholder="e.g. Tamil"
          />
        </div>

        <div className="form-field">
          <label htmlFor="secondLanguage">{t('admissions.secondLanguageLabel')}</label>
          <input
            type="text"
            id="secondLanguage"
            name="secondLanguage"
            value={form.secondLanguage}
            onChange={handleChange}
            placeholder="e.g. Tamil / Hindi"
          />
        </div>
      </div>
    </div>
  );
}
