/**
 * CONTENT SERVICE LAYER
 * Abstracts local JSON data access for the 6 core school pages.
 * Components must only call these functions and NEVER import JSON directly.
 */

import settingsData from '../content/settings.json';
import imagesData from '../content/images.json';
import navData from '../content/nav.json';
import programsData from '../content/programs.json';
import whyRowsData from '../content/whyRows.json';
import statsData from '../content/stats.json';
import testimonialsData from '../content/testimonials.json';
import dashboardData from '../content/dashboard.json';
import admissionsData from '../content/admissions.json';
import campusData from '../content/campus.json';
import academicsData from '../content/academics.json';
import aboutData from '../content/about.json';
import journeyData from '../content/journey.json';
import faqsData from '../content/faqs.json';

export function getSettings() {
  return settingsData;
}

export function getImages() {
  return imagesData;
}

export function getImageUrl(slotKey) {
  return (slotKey && imagesData[slotKey]) ? imagesData[slotKey] : null;
}

export function getNavLinks() {
  return navData;
}

export function getPrograms() {
  return programsData;
}

export function getWhyRows() {
  return whyRowsData;
}

export function getStats() {
  return statsData;
}

export function getTestimonials() {
  return testimonialsData;
}

export function getDashboardData() {
  return dashboardData;
}

export function getAdmissionsData() {
  return admissionsData;
}

export function getCampusData() {
  return campusData;
}

export function getAcademicsData() {
  return academicsData;
}

export function getAboutData() {
  return aboutData;
}

export function getJourney() {
  return journeyData;
}

export function getFaqs() {
  return faqsData;
}

/**
 * Form submission service handler.
 */
export async function submitFormPlaceholder(formName, data) {
  void formName;
  void data;
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    success: true,
    message: 'Your submission has been received successfully.'
  };
}
