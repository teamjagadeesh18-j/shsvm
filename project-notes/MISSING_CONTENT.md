# Missing Content & Information Inventory
## Sree Hari Saradha Vidhyalaya Matriculation School (S.H.S.V.M School)

This document tracks all content items, official data, and verification points required from the school administration. In accordance with project integrity standards, zero placeholder, invented, or unverified claims are rendered on the live website. Every section on the site currently presents strictly verified facts provided in the official school dataset.

---

### Missing Content Table

| Page / Component | Key / Section | Current State | What the School Must Provide |
| :--- | :--- | :--- | :--- |
| **Global / Contact / Footer** | Official Email Address | Omitted across Header, Footer, and Contact cards. Contact forms submit via internal routing without exposing public email. | Official school administration and admissions email address (e.g. `info@...` or `admissions@...`). |
| **Academics / Admissions** | Higher Secondary & Grade Range | Configured strictly to Primary (Grades 1–5), Upper Primary (Grades 6–8), and Secondary (Grades 9–10). Pre-KG, LKG, UKG and +1/+2 Higher Secondary are withheld. | Confirmation whether Pre-KG/Kindergarten is offered and whether Higher Secondary (+1 & +2) with specific streams (Bio-Maths, Computer Science, Commerce) is currently active. |
| **Fees Page / Admissions** | Fee Schedule & Breakdown | General enquiry notice displayed; all unverified numbers, tuition fees, add-on costs, and term amounts have been removed. | Approved academic year fee schedule for each standard/grade, term payment installments, and payment terms. |
| **Fees Page** | Official Bank Account Details | Removed unverified bank details. | Official bank name, branch name, account number, IFSC code, and payment instructions for NEFT/RTGS/UPI transfers. |
| **Home / Hero / Welcome Popup / Admissions** | Admissions Open Status Flag (`admissionsOpen`) | Set to `false` in `settings.json`. The "Admissions open" badge in the Hero and Welcome Popup is withheld until formally authorized. | Administrative confirmation on whether admissions are currently open for the academic cycle. |
| **Admissions Page** | Academic Year for Admissions | Not present in official settings. Withheld across the website (no unverified years such as 2026-27 displayed). | Official academic year for current admission intake (e.g. 2026–2027). |
| **Admissions Page** | WhatsApp Admissions Number | Configured to `https://wa.me/918939421231` based on the school telephone `+91 89394 21231`. | Formal administrative confirmation that `+91 89394 21231` is active and monitored on WhatsApp for admission enquiries. |
| **All Forms / Message Dispatch** | Direct-to-WhatsApp Form Submission | All forms (Contact form, Admission Enquiry form, Modal enquiry form) validate digits-only inputs with fixed +91 prefix and format structured plain text directly dispatched to WhatsApp (+91 89394 21231). | Administrative confirmation of WhatsApp Business intake preferences for receiving parent messages. |
| **Admissions / Home** | Community Reviews & Testimonials | `testimonials.json` is empty (`[]`). The Community Voice / Reviews marquee section is hidden until verified testimonials exist. | Real parent quotes with permission, student/alumni names, and written authorization to publish authentic reviews. |
| **Admissions Page** | Admission Dates & Required Documents | Standard procedure displayed: parents visit the office or call the school. Step-by-step timeline and criteria tables hidden. | Official dates for admission opening/closing, age cutoff criteria as of academic year, and checklist of required documents (birth certificate, TC, Aadhaar, marksheets). |
| **Home / Stats / About** | Student & Teacher Statistics | Replaced with verified historical facts: Established 1999, Co-educational, State Board, Pakkam, Thiruvallur. | Exact official student enrollment count and certified teacher strength if the school wishes to display live numbers. |
| **Home / Dashboard / About** | Board Examination Results | Live results bar chart and unverified "100% pass / centum" claims removed. | Official certified board examination performance data, top scores, or district accolades for recent academic years. |
| **Faculty Page** | Faculty Directory & Profiles | Displays teaching philosophy and state board qualification standards; individual teacher profiles hidden. | Full list of current teaching and administrative staff, designations, degrees/certifications, and experience. |
| **Home / About** | Principal's Message & Name | Attributed to "Office of the Principal" with factual educational values. | Full legal name, academic qualifications, official signed desk message, and high-resolution portrait photograph of the Principal. |
| **About Page** | Correspondent / Management Message | Attributed to "School Management & Trust" with factual governance commitments. | Official message, names of Correspondent / Trustees, and management profile. |
| **All Pages / Media** | Campus Photographs & Visuals | Rendered through `ImageSlot` with structured labels and fallback system. | High-resolution photographs of the actual school building in Pakkam, recreation playground, classrooms, events, and sports activities. |
| **Footer / Legal** | Affiliation / Recognition Number | Displays "State Board Matriculation School"; placeholder affiliation code removed. | Official Government of Tamil Nadu recognition/affiliation order number and code. |
| **Global / WhatsApp Button** | WhatsApp Helpline Number | Configured to `https://wa.me/918939421231` based on the provided phone number `+91 89394 21231`. | Confirmation whether `+91 89394 21231` is officially active on WhatsApp Business for student admissions chat. |
| **Home / Testimonials** | Parent Reviews & JustDial Rating | Testimonials section hidden until verified parent reviews are submitted. | Written consent/permission to display public JustDial ratings or signed testimonials from actual school parents and alumni. |
| **Campus / Transport** | School Transportation & Bus Routes | Only the 3 verified facilities (Academic Book Bank, Recreation Playground, Medical Support) are shown. All bus routes removed. | Confirmation whether the school operates dedicated transport/buses, along with vehicle numbers, route stops, and pickup timings. |

---

### Active Site Architecture (6 Core Verified Pages)
The site has been streamlined strictly to 6 verified, authoritative pages:
1. **Home (`/`)**: Hero, Royal Blue Marquee, Levels of Schooling (Primary, Upper Primary, Secondary), Photo Marquee (Events, Felicitation & Campus), Academic & Holistic Interactive Bento (`InkOrbitFeatures`), Campus Life Dashboard (`DashboardPanel`), Why Parents Choose Us, Key Highlights, Parent Testimonials, and Principal's Message.
2. **About (`/about`)**: Heedhive-matched narrative layout covering history, milestones (1999 to Present), leadership desk perspectives, core values (Smile, Study, Serve), curriculum continuum, and campus standards.
3. **Academics (`/academics`)**: Three schooling levels (Primary, Upper Primary, Secondary) following Tamil Nadu State Board syllabus.
4. **Apply for Admission (`/admissions`)**: Dedicated application & enquiry portal, admission guidelines, office hours (Mon–Sat 8:00 AM – 5:30 PM), direct helpline (`+91 89394 21231`), WhatsApp connect, and application form.
5. **Campus & Facilities (`/campus`)**: Factual verified facilities (Academic Book Bank, Recreation Playground, On-Campus Medical Care).
6. **Contact Us (`/contact`)**: School campus location in Pakkam, Thiruvallur District, direct helpline, Google Maps locator, and inquiry submission.

*Note: The 8 secondary pages (`Student Life`, `Gallery`, `News & Events`, `Alumni`, `Careers`, `Portal`, `Fees & Scholarships`, `Faculty`) have been completely removed along with their route mappings and content datasets.*

