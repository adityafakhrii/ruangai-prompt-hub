# RuangAI Prompt Hub

A comprehensive platform for discovering, sharing, and managing AI prompts. Built with modern web technologies, RuangAI Prompt Hub connects users with high-quality prompts for various AI models.

![Project Banner](https://placehold.co/1200x400/7bbede/ffffff?text=RuangAI+Prompt+Hub)

## 🚀 Features

- **Prompt Discovery**: Browse through a curated list of viral and trending prompts.
- **Smart Search**: Quickly find prompts using keywords or filter by categories.
- **User Authentication**: Secure login and registration powered by Supabase.
- **User Dashboard**: 
  - Manage personal profile details.
  - Securely update passwords (with verification).
  - View and manage saved/created prompts ("Prompt Saya").
- **Interactive UI**:
  - Copy prompts to clipboard with a single click.
  - Visual feedback with toast notifications.
  - Responsive design for mobile and desktop.
  - Dark/Light mode support (via system/UI).

## 🛠️ Tech Stack

This project is built using the following technologies:

- **Frontend Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: 
  - [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
  - [shadcn/ui](https://ui.shadcn.com/) (Re-usable components built with Radix UI and Tailwind CSS)
- **State Management & Data Fetching**: [@tanstack/react-query](https://tanstack.com/query/latest)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📦 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ruangai-prompt-hub.git
   cd ruangai-prompt-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`.

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # shadcn/ui primitive components
│   └── ...             # Custom components (Navbar, PromptCard, etc.)
├── contexts/           # React contexts (AuthContext, etc.)
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations (Supabase client)
├── lib/                # Utility functions and helpers
├── pages/              # Application route pages
│   ├── Auth.tsx        # Login/Register page
│   ├── Index.tsx       # Landing page
│   ├── Profile.tsx     # User profile management
│   └── ...
├── App.tsx             # Main application component & routing
└── main.tsx            # Entry point
```

## 🚀 Deployment

The project can be easily deployed to platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

1. Push your code to a Git repository (GitHub/GitLab).
2. Import the project into Vercel/Netlify.
3. Add the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) in the deployment settings.
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
