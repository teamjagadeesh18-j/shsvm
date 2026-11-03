# S.H.S.V.M School Website

Official website for **Sree Hari Saradha Vidhyalaya Matriculation School**, Pakkam, Thiruvallur District, Tamil Nadu.  
Motto: *Smile • Study • Serve*

This project is a React frontend built with Vite. It features responsive pages covering school curriculum, admissions enquiries, campus facilities, leadership perspectives, and school location details.

---

## Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### Installation
Navigate to the project root or the `client` directory:
```bash
cd client
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.

### Production Build
Create an optimized production bundle:
```bash
npm run build
```
The compiled static assets will be output to the `dist/` folder.

### Local Preview
Preview the production build locally:
```bash
npm run preview
```

### Linting
Run the code quality checks:
```bash
npm run lint
```

---

## Project Structure & Content Management

```
client/
├── public/
│   ├── images/                # School photographs and logo crest
│   └── site.webmanifest       # Web application manifest
├── src/
│   ├── components/            # UI components (Header, Footer, Hero, Sections)
│   ├── content/               # Site text and structured datasets (JSON)
│   │   ├── en.json            # Primary text copy and section strings
│   │   ├── about.json         # History, milestones, and vision
│   │   ├── academics.json     # Curriculum stages and daily bell schedule
│   │   ├── admissions.json    # Application steps and guidelines
│   │   ├── campus.json        # Campus facilities
│   │   ├── images.json        # Image slot key mappings
│   │   └── settings.json      # School address, phone, timings, and map coordinates
│   ├── pages/                 # Route pages (Home, About, Academics, Admissions, Campus, Contact)
│   ├── services/              # Data access services (content.js, whatsapp.js)
│   └── styles/                # Global styles and design tokens (tokens.css, global.css)
```

### Updating Content
- **School Copy & Headings**: Edit strings in `src/content/en.json`.
- **School Timings, Phone & Location**: Edit values in `src/content/settings.json`.
- **Photographs**: Add new image files to `public/images/` and update the mapping in `src/content/images.json`.
- **Design Tokens**: Colors, typography, spacing, and border radii are defined in `src/styles/tokens.css`.
