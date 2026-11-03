import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AcademicHistoryFields({ form, errors, handleChange, levels, tcOptions }) {
  const { t } = useTranslation();

  return (
    <div className="form-group-block">
      <div className="form-group-badge">{t('admissions.group3Title')}</div>
      <div className="form-grid-3">
        <div className="form-field">
          <label htmlFor="level">
            {t('admissions.levelLabel')} <span className="req">*</span>
          </label>
          <select
            id="level"
            name="level"
            value={form.level}
            onChange={handleChange}
            aria-invalid={!!errors.level}
            aria-describedby={errors.level ? 'level-error' : undefined}
            className={errors.level ? 'input-error' : ''}
          >
            <option value="">-- Select Schooling Level --</option>
            {levels.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>
                {lvl.label}
              </option>
            ))}
          </select>
          {errors.level && (
            <span id="level-error" className="field-error-msg">{errors.level}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="gradeClass">{t('admissions.gradeClassLabel')}</label>
          <input
            type="text"
            id="gradeClass"
            name="gradeClass"
            value={form.gradeClass}
            onChange={handleChange}
            placeholder="e.g. Grade 1, Grade 6"
          />
        </div>

        <div className="form-field">
          <label htmlFor="previousSchool">{t('admissions.previousSchoolLabel')}</label>
          <input
            type="text"
            id="previousSchool"
            name="previousSchool"
            value={form.previousSchool}
            onChange={handleChange}
            placeholder="School name and last class"
          />
        </div>

        <div className="form-field">
          <label htmlFor="tcAvailable">{t('admissions.tcAvailableLabel')}</label>
          <select
            id="tcAvailable"
            name="tcAvailable"
            value={form.tcAvailable}
            onChange={handleChange}
          >
            {tcOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field span-2">
          <label htmlFor="message">{t('admissions.messageLabel')}</label>
          <textarea
            id="message"
            name="message"
            rows={2}
            value={form.message}
            onChange={handleChange}
            placeholder="Any specific questions, sibling details, or requests..."
          />
        </div>
      </div>
    </div>
  );
}
