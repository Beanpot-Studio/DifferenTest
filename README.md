<p align="center">
  <img src="https://raw.githubusercontent.com/jlooper/LearningPortal/main/public/logo.png" alt="DifferenTest Logo" width="200" />
</p>

<h1 align="center">DifferenTest</h1>

<p align="center">
  <strong>AI-powered differentiated assessment platform for modern educators.</strong>
</p>

<p align="center">
  <a href="https://github.com/jlooper/LearningPortal">GitHub</a> ·
  <a href="#-key-features">Features</a> ·
  <a href="#-demos">Demos</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-architecture">Architecture</a>
</p>

<br/>

DifferenTest is an open-source educational platform built by [Beanpot Studio](https://beanpotstudio.com) that empowers teachers to create, manage, and deliver AI-generated differentiated assessments. Upload a lesson plan, and DifferenTest automatically generates editable, age-appropriate quizzes with instant feedback, progress tracking, and verifiable micro-credentials.

---

## 🎬 Demos

Check out DifferenTest in action with these free, open courses:

<table>
  <tr>
    <td width="50%" align="center">
      <a href="https://github.com/jlooper/LearningPortal/tree/main/src/pages/courses/DCEBjGMJurMxtaFMuBUJ">
        <img src="https://raw.githubusercontent.com/jlooper/LearningPortal/main/public/acatemy-home.png" alt="aCATemy - AI for Kids" width="100%" />
        <br/>
        <strong>🤖 aCATemy: Artificial Intelligence for Kids</strong>
      </a>
      <br/>
      <em>Designed for kids in grades 1-3, a gentle introduction to AI hosted by cheerful cats. Free badges & certificates!</em>
    </td>
    <td width="50%" align="center">
      <a href="https://github.com/jlooper/LearningPortal/tree/main/src/pages/courses/s150MQygG0PwnUPSsZUJ">
        <img src="https://raw.githubusercontent.com/jlooper/LearningPortal/main/public/webdev-home.png" alt="Web Development Fundamentals" width="100%" />
        <br/>
        <strong>🌐 Web Development Fundamentals</strong>
      </a>
      <br/>
      <em>Learn HTML, CSS, and JavaScript basics with a comprehensive project-based curriculum.</em>
    </td>
  </tr>
</table>

---

## ✨ Key Features

### 🤖 AI-Powered Quiz Generation
Upload lesson plans and learning objectives — DifferenTest uses Google Gemini AI to automatically generate differentiated, editable multiple-choice assessments tailored to your students' level.

### 🎯 Differentiated Assessments
Each quiz can be adapted for different age groups (Elementary, Middle School, High School, College/Adult), ensuring every student gets the right level of challenge.

### 🏆 Micro-Credentialing & Badges
Students earn Open Badge 3.0-compliant verifiable credentials for perfect scores. Badges stack toward full certificates, creating a clear achievement pathway.

### 📊 Comprehensive Analytics
Track student performance with detailed dashboards, submission histories, and class-wide progress metrics. Teachers get actionable insights at a glance.

### 👩‍🏫 Dual Portal System
- **Teacher Portal**: Create classes, manage enrollments, generate quizzes, review submissions, and communicate with students.
- **Student Portal**: Access courses, take quizzes, track progress, earn badges, and view certificates.

### 🎨 Themed Learning Experiences
Engage younger learners with themed skins (e.g., cat-themed quizzes with animated characters) that make assessments fun and approachable.

### 🔗 Embeddable Quizzes
Quizzes can be embedded in external websites via a public API, making DifferenTest a flexible assessment tool for any learning environment.

### 💬 Built-in Communication
Teachers and students can communicate securely through the platform's messaging system.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- A Firebase project (Firestore, Authentication, Storage)
- A Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/beanpotstudio/differentest.git
cd differentest

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file with the following:

```env
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
PUBLIC_GEMINI_API_KEY=your_gemini_api_key
VITE_USE_FIREBASE_EMULATOR=false
```

### Development

```bash
# Start the development server
npm run dev

# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | [Astro](https://astro.build/) + [Vue.js 3](https://vuejs.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Backend & Database** | [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage) |
| **AI** | [Google Gemini API](https://ai.google.dev/) |
| **Animations** | [LottieFiles](https://lottiefiles.com/) (`.lottie` animations) |
| **Charts** | Chart.js, ApexCharts |
| **Testing** | Vitest (unit), Playwright (e2e) |
| **Deployment** | Netlify |

### Firebase Data Model

```
users          → Profiles, roles (student/teacher), class enrollments
classes        → Course metadata, teacher info, skin themes, access codes
enrollments    → Student-class relationships with status tracking
quizzes        → Quiz content, questions, lesson plans, badge images
quizAttempts   → Student submissions, scores, selected answers, timestamps
activities     → Audit log of platform events (enrollments, quiz completions)
```

### Project Structure

```
src/
├── components/       # Vue.js components
│   ├── ui/           # Reusable UI components (Header, Footer, Modals)
│   ├── services/     # Animation, notification, icon services
│   └── skins/        # Themed quiz result components (e.g., CatQuizResult)
├── composables/      # Vue composables (useNotification, useSkin)
├── layouts/          # Astro layouts
├── lib/              # Firebase config, service layer, auth
├── pages/            # Astro pages (home, courses, teacher, student, admin)
├── stores/           # Pinia-like auth store
├── styles/           # Global CSS, themed styles (cats.css)
├── utils/            # Utilities (Cloudinary upload, Firebase helpers, math)
└── plugins/          # Markdown quiz plugin
```

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

---

## 🛠️ Usage

### For Teachers

1. **Create a Class** — Set up a course with a name, age group, and optional theme skin.
2. **Generate Quizzes** — Upload a lesson plan or write learning objectives; AI generates a differentiated quiz.
3. **Manage Enrollments** — Share the unique class code with students; approve or manage enrollments.
4. **Review Submissions** — View student quiz attempts, scores, and time spent.
5. **Issue Credentials** — Award badges and certificates for achievements.

### For Students

1. **Join a Class** — Use a class code to enroll in a teacher's course.
2. **Take Quizzes** — Complete AI-generated assessments with instant feedback.
3. **Track Progress** — View your scores, badges, and certificates on your dashboard.
4. **Earn Credentials** — Achieve perfect scores to earn verifiable Open Badges.

---

## 🌐 Deployment

DifferenTest is pre-configured for deployment on [Netlify](https://www.netlify.com/) via `@astrojs/netlify`. Deploy by connecting your repository or using the CLI:

```bash
npm run build
npx netlify deploy --prod
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.

You are free to share and adapt the material for **non-commercial** purposes, as long as you provide attribution and distribute any adaptations under the same license. Commercial use requires a separate license from [Beanpot Studio](https://beanpotstudio.com).

See the [LICENSE](LICENSE) file for the full license text.

---

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build/) and [Vue.js](https://vuejs.org/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Backend by [Firebase](https://firebase.google.com/)

---

## 📬 Contact

- **Author**: Jen Looper via Beanpot Studio - beanpotstudio.com

---

*DifferenTest — Differentiated assessments for every learner.*