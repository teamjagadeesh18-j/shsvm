import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getSettings } from '../../../services/content';

/**
 * Standardized SEO Component
 * Injects verified meta tags and rich Schema.org JSON-LD across all routes.
 */
export default function SEO({
  title,
  description,
  path = '',
  type = 'website',
  pageType = 'WebPage',
  extraSchemas = []
}) {
  const settings = getSettings();
  const siteUrl = settings?.siteUrl || 'https://shsvm-school.edu.in';
  const canonicalUrl = `${siteUrl}${path === '/' ? '' : path}`;
  const ogImageUrl = `${siteUrl}/images/school-campus.jpg`;
  const logoUrl = `${siteUrl}/images/logo.png`;

  const schoolSchema = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'School'],
    '@id': `${siteUrl}/#school`,
    'name': settings.name,
    'alternateName': settings.alternateNames || [
      'Sree Hari Saradha Vidyalaya',
      'Shree Hari Saradha Vidhayalaiya',
      'S.H.S.V.M School',
      'SHSVM'
    ],
    'url': siteUrl,
    'logo': logoUrl,
    'image': ogImageUrl,
    'description': description || 'Co-educational Tamil Nadu State Board Matriculation school in Pakkam, Thiruvallur District, established in 1999.',
    'foundingDate': String(settings.established || '1999'),
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': settings.addressStreet || 'Korattur Thinnanur Periyapalayam Road, SH-50A',
      'addressLocality': settings.addressLocality || 'Pakkam',
      'addressRegion': settings.addressRegion || 'Tamil Nadu',
      'postalCode': settings.postalCode || '602024',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': settings.latitude || 13.1536061,
      'longitude': settings.longitude || 80.0378861
    },
    'telephone': settings.phone || '+91 89394 21231',
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '08:00',
        'closes': '17:30'
      }
    ],
    'sameAs': [
      settings?.social?.instagram,
      settings?.social?.facebook,
      settings?.social?.youtube,
      settings?.openInMapsUrl
    ].filter(Boolean),
    'areaServed': [
      { '@type': 'AdministrativeArea', 'name': 'Pakkam' },
      { '@type': 'AdministrativeArea', 'name': 'Thiruvallur District' },
      { '@type': 'AdministrativeArea', 'name': 'Avadi' }
    ],
    'amenityFeature': (settings.facilities || []).map(fac => ({
      '@type': 'LocationFeatureSpecification',
      'name': fac,
      'value': true
    })),
    'hasMap': settings.openInMapsUrl || 'https://www.google.com/maps/search/?api=1&query=13.1536061,80.0378861'
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': `${canonicalUrl}#webpage`,
    'url': canonicalUrl,
    'name': title,
    'description': description,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      'name': settings.name,
      'url': siteUrl,
      'publisher': { '@id': `${siteUrl}/#school` }
    },
    'inLanguage': 'en-IN',
    'dateModified': '2026-11-02'
  };

  let breadcrumbSchema = null;
  if (path && path !== '/') {
    const routeTitles = {
      '/about': 'About Us',
      '/academics': 'Academics',
      '/admissions': 'Admissions',
      '/campus': 'Campus & Facilities',
      '/contact': 'Contact Us',
      '/faq': 'Frequently Asked Questions'
    };
    const currentName = routeTitles[path] || (title ? title.split('|')[0].trim() : 'Page');
    breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': currentName,
          'item': canonicalUrl
        }
      ]
    };
  }

  const allSchemas = [schoolSchema, webPageSchema, breadcrumbSchema, ...extraSchemas].filter(Boolean);

  return (
    <>
      <Helmet>
        {/* Primary HTML Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* Verification Placeholders */}
        {Boolean(settings?.verification?.google) && (
          <meta name="google-site-verification" content={settings.verification.google} />
        )}
        {Boolean(settings?.verification?.bing) && (
          <meta name="msvalidate.01" content={settings.verification.bing} />
        )}

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Sree Hari Saradha Vidhyalaya Matriculation School Campus Building" />
        <meta property="og:site_name" content={settings.name} />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />

        {/* Structured Data JSON-LD in head */}
        {allSchemas.map((schemaObj, sIdx) => (
          <script key={sIdx} type="application/ld+json">
            {JSON.stringify(schemaObj)}
          </script>
        ))}
      </Helmet>

      {/* Structured Data JSON-LD (guaranteed presence) */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}

