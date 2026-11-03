const fs = require('fs');

const en = JSON.parse(fs.readFileSync('client/src/content/en.json', 'utf8'));

// 1. Branding and Settings
en.schoolName = "Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School)";
en.schoolTagline = "Smile • Study • Serve";
en.schoolFullName = "Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School)";
en.footerMotto = "Smile • Study • Serve";
en.footerAbout = "Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School), established in 1999 in Pakkam, Thiruvallur District, Tamil Nadu. A co-educational Matriculation school following the State Board.";
en.address = "Sree Hari Saradha Vidyalaya Matriculation School, Pakkam, Thiruvallur District, Tamil Nadu 602024";
en.phone = "+91 89394 21231";
en.timings = "Monday to Saturday, 8:00 AM to 5:30 PM. Sunday closed.";
en.copyright = "© 2026 Sree Hari Saradha Vidhyalaya Matriculation School";
delete en.email;

// 2. Hero Section
en.heroSubtext = "Educating children in Pakkam, Thiruvallur since 1999 with discipline, care and a lifelong love of learning.";
en.heroAchievements = "KEY SCHOOL HIGHLIGHTS";
en.badgeBoard = "Tamil Nadu State Board Matriculation";
en.badgePass = "Co-educational Schooling";
en.badgeLegacy = "Established 1999";
en.badgeStem = "Pakkam, Thiruvallur";
en.heroTypewords = [
  "Smile, Study, Serve",
  "Primary to Secondary",
  "Academic & Arts Focus",
  "Care & Discipline"
];

// 3. Marquee Ticker
en.marqueeText = "SMILE • STUDY • SERVE  ✱  ESTABLISHED 1999  ✱  STATE BOARD MATRICULATION  ✱  PRIMARY TO SECONDARY  ✱  ACADEMIC BOOK BANK  ✱  RECREATION PLAYGROUND  ✱  MEDICAL SUPPORT  ✱  PAKKAM, THIRUVALLUR  ✱";
en.marqueeItems = [
  "SMILE • STUDY • SERVE",
  "ESTABLISHED 1999",
  "STATE BOARD MATRICULATION",
  "CO-EDUCATIONAL",
  "ACADEMIC BOOK BANK",
  "RECREATION PLAYGROUND",
  "MEDICAL SUPPORT",
  "PAKKAM, THIRUVALLUR"
];

// 4. Programs Section (3 levels)
en.programsTitle = "Levels of Schooling";
en.programsSubtitle = "Comprehensive educational continuum following the Tamil Nadu State Board curriculum across academics, arts, and physical fitness.";
en.prog1Title = "Primary Schooling";
en.prog1Desc = "Foundational education in academic subjects, creative arts, and physical education under the State Board.";
en.prog2Title = "Upper Primary Schooling";
en.prog2Desc = "Progressive middle-years curriculum building strong analytical understanding, languages, and sciences.";
en.prog3Title = "Secondary Schooling";
en.prog3Desc = "Rigorous secondary education aligned with the Tamil Nadu Matriculation Board curriculum.";

// 5. Life / Dashboard Panel
en.lifeTitle = "Life at";
en.lifeTitleSub = "SHSVM Campus";
en.tagLife = "CAMPUS LIFE";
en.card1Title = "School Routine & Hours";
en.card2Title = "School Highlights";
en.card3Title = "Beyond the Classroom";
en.liveTag = "Estd. 1999";
en.statPassRate = "Estd. 1999";
en.statPassDesc = "Over 25 years of educational service";
en.statStudents = "Co-Educational";
en.statStudentsDesc = "State Board Matriculation";
en.statToppers = "Pakkam";
en.statToppersDesc = "Thiruvallur District, TN";
en.beyond1 = "Recreation Playground Sports & Games";
en.beyond2 = "Creative Arts & Cultural Expression";
en.beyond3 = "Academic Book Bank & Study Resources";
en.beyond4 = "Moral Discipline & Community Values";

// 6. Why Parents Choose Us
en.whyTitle = "Why Parents";
en.whyTitleSub = "Choose SHSVM";
en.why1Title = "Established in 1999 with Clear Motto";
en.why1Desc = "Founded in Pakkam with the enduring motto Smile • Study • Serve, bringing value-based education to every child.";
en.why2Title = "State Board Matriculation Curriculum";
en.why2Desc = "Co-educational schooling following the Tamil Nadu State Board syllabus across academics, arts, and physical education.";
en.why3Title = "Primary, Upper Primary & Secondary Schooling";
en.why3Desc = "Structured curriculum continuum guiding students from foundational grades through secondary matriculation examinations.";
en.why4Title = "Essential Campus Facilities";
en.why4Desc = "Equipped with an Academic Book Bank, dedicated Recreation Playground, and on-campus Medical Support.";
en.why5Title = "Caring & Disciplined Campus in Pakkam";
en.why5Desc = "An accessible, welcoming learning environment for students of all backgrounds in Thiruvallur District.";

// 7. Stats
en.stat1Num = "1999";
en.stat1Title = "Established";
en.stat1Desc = "Serving Pakkam since 1999";
en.stat2Num = "Co-Ed";
en.stat2Title = "Co-educational";
en.stat2Desc = "Welcoming all students";
en.stat3Num = "TN Board";
en.stat3Title = "Matriculation";
en.stat3Desc = "Tamil Nadu State Board";
en.stat4Num = "Pakkam";
en.stat4Title = "Thiruvallur Dist.";
en.stat4Desc = "PIN 602024, Tamil Nadu";

// 8. Principal Desk
en.principalTag = "LEADERSHIP DESK";
en.principalQuote = "Education is the foundation for character, curiosity, and disciplined growth in every child.";
en.principalQuoteHighlight = "Grounded in Smile, Study, Serve.";
en.principalBody = "At Sree Hari Saradha Vidhyalaya Matriculation School, our educators guide students through the Tamil Nadu State Board curriculum with personal care, integrating academic studies, creative arts, and physical education.";
en.principalName = "Office of the Principal";
en.principalRole = "Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";

// 9. About Page i18n
if (!en.about) en.about = {};
en.about.pageTitle = "About Us | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.about.pageDescription = "About Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam, Thiruvallur District. Estd. 1999, co-educational, State Board Matriculation school.";
en.about.heroBadge = "ABOUT OUR SCHOOL";
en.about.heroTitle = "Who We";
en.about.heroHighlight = "Are";
en.about.heroSubtitle = "A co-educational Matriculation school in Pakkam, Thiruvallur District, Tamil Nadu, following the State Board curriculum since 1999 with the motto Smile • Study • Serve.";
en.about.storyBadge = "OUR STORY";
en.about.storyTitle = "A School Built on";
en.about.storyHighlight = "Care & Values";
en.about.storySubtitle = "Established in 1999 in Pakkam, Thiruvallur District, Sree Hari Saradha Vidhyalaya Matriculation School provides holistic schooling rooted in academic subjects, arts, and physical education.";
en.about.journeyHeading = "Our Milestones";
en.about.finalCardTitle = "Since 1999";
en.about.finalCardDesc = "Co-educational · State Board Matriculation · Pakkam, Thiruvallur";
en.about.finalCardAction = "Explore Our Academics →";
en.about.leadershipContainerTag = "LEADERSHIP PERSPECTIVES";
en.about.leadershipPrincipalTitle = "Principal's Desk";
en.about.leadershipManagementTitle = "Management Vision";
en.about.mottoTag = "OUR CORE MOTTO";
en.about.mottoTitle = "Smile. Study.";
en.about.mottoHighlight = "Serve.";
en.about.mottoSubtitle = "The foundational pillars that guide every classroom, playground activity, and student interaction at SHSVM.";
en.about.standForBadge = "WHAT WE OFFER";
en.about.standForTitle = "Our Campus";
en.about.standForHighlight = "Commitments";
en.about.checklistTitle = "Core Educational Standards";
en.about.checklistItems = [
  "Caring, Emotionally Safe Campus Environment",
  "Tamil Nadu State Board Matriculation Syllabus",
  "Primary, Upper Primary & Secondary Levels",
  "Academic Book Bank & Curated Study Literature",
  "Recreation Playground for Physical Wellness",
  "On-Campus First-Aid & Medical Support"
];
en.about.leadershipListTitle = "Curriculum Areas";
en.about.departmentHeads = [
  { dept: "Core Academic Subjects", head: "State Board Faculty", qualification: "Primary to Secondary" },
  { dept: "Creative & Performing Arts", head: "Arts & Cultural Mentors", qualification: "Creative Arts" },
  { dept: "Physical Fitness & Sports", head: "Physical Education Staff", qualification: "Recreation Playground" }
];
en.about.academicFacilityTitle = "Academic Book Bank";
en.about.academicFacilityDesc = "Curated textbooks, reference materials, and study resources supporting students from foundational grades to secondary education.";
en.about.holisticFacilityTitle = "Recreation & Medical Support";
en.about.holisticFacilityDesc = "Dedicated recreation playground for athletics and outdoor games, complemented by immediate on-campus first-aid and medical care.";
en.about.exploreMoreTitle = "Explore More About SHSVM";
en.about.exploreAcademicsTitle = "Academic Stages";
en.about.exploreAcademicsDesc = "Primary, Upper Primary, and Secondary schooling following the State Board.";
en.about.exploreAdmissionsTitle = "Admissions Office";
en.about.exploreAdmissionsDesc = "Welcome applications from students of all backgrounds.";
en.about.exploreCampusTitle = "Campus Facilities";
en.about.exploreCampusDesc = "Academic Book Bank, recreation playground, and medical support on campus.";
en.about.ctaTitle = "Become Part of the SHSVM Family";
en.about.ctaSubtitle = "Educating children in Pakkam, Thiruvallur since 1999 with discipline, care, and a lifelong love of learning.";
en.about.marqueeLine1 = [
  "Smile • Study • Serve",
  "State Board Matriculation",
  "Primary to Secondary Schooling",
  "Academic Book Bank",
  "Recreation Playground",
  "Medical Support",
  "Pakkam, Thiruvallur"
];
en.about.marqueeLine2 = [
  { text: "Established in 1999", highlight: false },
  { text: "Co-educational Schooling", highlight: true },
  { text: "Tamil Nadu State Board", highlight: false },
  { text: "Academic Subjects & Arts", highlight: false },
  { text: "Physical Education & Sports", highlight: false },
  { text: "Pakkam, Thiruvallur PIN 602024", highlight: true }
];

// 10. Academics Page i18n
if (!en.academics) en.academics = {};
en.academics.pageTitle = "Academics | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.academics.pageDescription = "Academics at SHSVM School, Pakkam: Primary, Upper Primary, and Secondary schooling following the Tamil Nadu State Board curriculum.";
en.academics.heroBadge = "ACADEMIC EXCELLENCE";
en.academics.heroTitle = "Curriculum &";
en.academics.heroHighlight = "Academic Stages";
en.academics.heroSubtitle = "Providing balanced education covering academic subjects, arts, and physical education under the Tamil Nadu State Board.";
en.academics.continuumTag = "CURRICULUM STAGES";
en.academics.continuumTitle = "Three Schooling Stages";
en.academics.continuumSubtitle = "Structured progression through Primary, Upper Primary, and Secondary levels.";
en.academics.rhythmTitle = "Daily School";
en.academics.rhythmSubtitle = "Schedule & Routine";
en.academics.ctaTitle = "Enquire About Academic Admissions";
en.academics.ctaHighlight = "For 2026-27";
en.academics.ctaText = "Contact the school admissions office in Pakkam to learn more about our curriculum and enrollment process.";
en.academics.ctaButton = "Contact Admissions Office >";

// 11. Admissions Page i18n
if (!en.admissions) en.admissions = {};
en.admissions.pageTitle = "Admissions | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.admissions.pageDescription = "Admissions at SHSVM School, Pakkam. Welcoming applications for Primary, Upper Primary, and Secondary schooling. Office hours Mon-Sat 8:00 AM - 5:30 PM.";
en.admissions.heroBadge = "ADMISSIONS DESK";
en.admissions.heroTitle = "Admissions at";
en.admissions.heroHighlight = "SHSVM School";
en.admissions.heroSubtitle = "Welcoming students of all backgrounds in Pakkam, Thiruvallur District. Visit our admissions desk or call the school.";

// 12. Campus Page i18n
if (!en.campus) en.campus = {};
en.campus.pageTitle = "Campus & Facilities | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.campus.pageDescription = "Explore the campus facilities of SHSVM School, Pakkam: Academic Book Bank, Recreation Playground, and on-campus Medical Support.";
en.campus.heroBadge = "CAMPUS & FACILITIES";
en.campus.heroTitle = "Our School";
en.campus.heroHighlight = "Facilities";
en.campus.heroSubtitle = "Essential facilities supporting academic studies, sports, and student health in Pakkam, Thiruvallur District.";

// 13. Faculty Page i18n
if (!en.faculty) en.faculty = {};
en.faculty.pageTitle = "Faculty & Mentors | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.faculty.pageDescription = "Dedicated educators at SHSVM School, Pakkam teaching academic subjects, creative arts, and physical education under the State Board.";
en.faculty.heroBadge = "TEACHING FACULTY";
en.faculty.heroTitle = "Dedicated";
en.faculty.heroHighlight = "Educators";
en.faculty.heroSubtitle = "Qualified teachers providing compassionate guidance across Primary, Upper Primary, and Secondary grades in Pakkam.";

// 14. Fees Page i18n
if (!en.fees) en.fees = {};
en.fees.pageTitle = "Fee Information | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.fees.pageDescription = "Fee policies and guidelines for Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam, Thiruvallur District.";

// 15. Contact Page i18n
if (!en.contact) en.contact = {};
en.contact.pageTitle = "Contact Us | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.contact.pageDescription = "Contact Sree Hari Saradha Vidhyalaya Matriculation School in Pakkam, Thiruvallur District, Tamil Nadu. Phone: +91 89394 21231. Office hours Mon-Sat 8:00 AM - 5:30 PM.";
en.contact.heroBadge = "GET IN TOUCH";
en.contact.heroTitle = "Contact Our";
en.contact.heroHighlight = "Campus Desk";
en.contact.heroSubtitle = "We are located at Pakkam in Thiruvallur District. Reach out by phone, WhatsApp, or visit during office hours.";

// 16. Gallery, News, Alumni, Careers, Portal, Home Meta Titles
if (!en.home) en.home = {};
en.home.pageTitle = "Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School) | Pakkam";
en.home.pageDescription = "Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School), est. 1999, Pakkam, Thiruvallur District, Tamil Nadu. Motto: Smile • Study • Serve. Co-educational State Board Matriculation school.";

if (!en.gallery) en.gallery = {};
en.gallery.pageTitle = "Photo Gallery | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.gallery.pageDescription = "Moments from academic activities, sports days, and cultural celebrations at SHSVM School in Pakkam.";

if (!en.news) en.news = {};
en.news.pageTitle = "News & Announcements | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.news.pageDescription = "Latest updates, examination circulars, and school events from SHSVM School, Pakkam.";

if (!en.alumni) en.alumni = {};
en.alumni.pageTitle = "Alumni Registry | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.alumni.pageDescription = "Connect with the alumni community of SHSVM School, Pakkam. Established 1999.";

if (!en.careers) en.careers = {};
en.careers.pageTitle = "Teaching Careers | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.careers.pageDescription = "Explore teaching opportunities at Sree Hari Saradha Vidhyalaya Matriculation School in Pakkam, Thiruvallur District.";

if (!en.portal) en.portal = {};
en.portal.pageTitle = "Portal Demonstration | Sree Hari Saradha Vidhyalaya Matriculation School, Pakkam";
en.portal.pageDescription = "Student and parent portal demonstration for SHSVM School, Pakkam.";

fs.writeFileSync('client/src/content/en.json', JSON.stringify(en, null, 2) + '\n', 'utf8');
console.log('Successfully updated en.json!');

