import { getSettings } from './content.js';

/**
 * Strips newlines and control characters from single-line inputs
 */
function sanitizeSingleLine(val) {
  if (typeof val !== 'string') return '';
  return val.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Builds structured plain-text message for WhatsApp.
 * Supports contact, admission, enquiry, careers, and alumni forms.
 */
export function buildMessage(formType, values = {}) {
  const headers = {
    contact: 'New Contact Message',
    admission: 'New Admission Enquiry',
    enquiry: 'New General Enquiry',
    careers: 'New Careers Enquiry',
    alumni: 'New Alumni Message'
  };

  const header = headers[formType] || 'New Website Enquiry';
  const lines = [header];

  // Helper to add sanitized line if non-empty
  const addLine = (label, val) => {
    const clean = sanitizeSingleLine(val);
    if (clean) lines.push(`${label}: ${clean}`);
  };

  if (formType === 'contact') {
    addLine('Name', values.name);
    addLine('Phone', values.phone ? `+91 ${values.phone}` : '');
    addLine('Email', values.email);
    addLine('Subject', values.subject);
  } else if (formType === 'admission') {
    addLine('Pupil', values.pupilName);
    if (values.dob) {
      const parts = values.dob.trim().split('-');
      const formattedDob = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : values.dob.trim();
      addLine('Date of Birth', formattedDob);
    }
    addLine('Gender', values.gender);
    addLine('Blood Group', values.bloodGroup);
    addLine('Mother Tongue', values.motherTongue);
    addLine('Religion / Caste', values.religion);
    addLine('Father / Guardian', values.fatherName);
    addLine('Father Mobile', values.fatherMobile ? `+91 ${values.fatherMobile}` : '');
    addLine('Mother Name', values.motherName);
    addLine('Mother Mobile', values.motherMobile ? `+91 ${values.motherMobile}` : '');
    addLine('Residential Address', values.residentialAddress);
    addLine('Pincode', values.pincode);
    addLine('Standard Seeking Admission', values.standard);
    addLine('Previous School', values.previousSchool);
    addLine('Last Standard Studied', values.lastStandard);
    addLine('Transfer Certificate', values.tcAvailable);
  } else if (formType === 'enquiry') {
    addLine('Parent / Guardian', values.parentName);
    addLine('Student Name', values.studentName);
    if (values.dob) addLine('Date of Birth', values.dob);
    addLine('Grade / Level', values.grade);
    addLine('Contact Phone', values.phone ? `+91 ${values.phone}` : '');
    addLine('Email', values.email);
    addLine('Subject', values.subject);
  } else {
    // Generic fallback for any other form type (careers, alumni, etc.)
    Object.entries(values).forEach(([k, v]) => {
      if (k !== 'message' && k !== 'notes' && k !== 'consent') {
        addLine(k.charAt(0).toUpperCase() + k.slice(1), v);
      }
    });
  }

  // Handle free-text message/notes (with max length enforcement)
  const rawNotes = values.message || values.notes || values.specialRequests || '';
  if (typeof rawNotes === 'string' && rawNotes.trim()) {
    let cleanNotes = rawNotes.trim();
    // Keep total message under 1400 characters for reliable WhatsApp encoding
    const currentLen = lines.join('\n').length;
    const maxNotesLen = Math.max(100, 1400 - currentLen - 50);
    if (cleanNotes.length > maxNotesLen) {
      cleanNotes = cleanNotes.slice(0, maxNotesLen).trim() + '... (shortened)';
    }
    lines.push(`Message: ${cleanNotes}`);
  }

  lines.push('Sent from the school website');
  return lines.join('\n');
}

/**
 * Returns the full WhatsApp click-to-chat URL with the encoded message.
 */
export function getWhatsAppUrl(message) {
  const settings = getSettings();
  const phone = settings?.whatsappNumber || '918939421231';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp in a new tab.
 * Returns an object with success status and fallback URL.
 */
export function openWhatsApp(message) {
  const url = getWhatsAppUrl(message);
  let win = null;
  try {
    win = window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    win = null;
  }
  const success = !!(win && !win.closed);
  return { success, url, message };
}

/**
 * Backward compatibility helpers
 */
export function buildAdmissionWhatsAppMessage(formData) {
  return buildMessage('admission', formData);
}

export function getAdmissionWhatsAppUrl(formData) {
  const message = buildAdmissionWhatsAppMessage(formData);
  return getWhatsAppUrl(message);
}
