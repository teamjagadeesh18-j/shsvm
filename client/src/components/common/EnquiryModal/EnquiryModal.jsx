import React from 'react';
import { useTranslation } from 'react-i18next';
import EnquiryForm from '../EnquiryForm/EnquiryForm';
import './EnquiryModal.css';

export default function EnquiryModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="custom-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h3 className="modal-title">{t('enquiryModalTitle')}</h3>
        <p className="modal-subtitle">{t('enquiryModalSubtitle')}</p>

        <EnquiryForm
          formName="Modal Admissions Enquiry"
          onSuccess={() => setTimeout(onClose, 2500)}
          showDob={false}
          showNotes={true}
        />
      </div>
    </div>
  );
}
