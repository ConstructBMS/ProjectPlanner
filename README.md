# Construct Scheduler

A modern project planning and scheduling application built with React, Vite, and Tailwind CSS.

## 🚀 Features

- Modern React development with Vite
- Tailwind CSS for styling
- ESLint and Prettier for code quality
- Git hooks with Husky
- Supabase integration for data persistence

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Husky, lint-staged

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd projectplanner
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔧 Development Setup

### VS Code Extensions

Install the recommended extensions for the best development experience:

1. Prettier - Code formatter
2. ESLint - JavaScript linting
3. Tailwind CSS IntelliSense - Tailwind CSS support
4. Auto Rename Tag - HTML/JSX tag renaming
5. Path Intellisense - Path autocompletion

### Code Quality

This project uses:

- **ESLint** for code linting and error detection
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit code quality checks

### Git Hooks

The following git hooks are configured:

- **pre-commit**: Runs ESLint and Prettier on staged files

## 📁 Project Structure

```
projectplanner/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Page components
│   ├── supabase/      # Supabase client configuration
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── .vscode/          # VS Code settings
├── .husky/           # Git hooks
└── config files      # Various configuration files
```

## 🎨 Styling Guidelines

- Use Tailwind CSS utility classes
- Follow the established color scheme:
  - `ribbonBlue`: #e5ecf6
  - `ganttGrid`: #f5f5f5
  - `panelHeader`: #dfe3e8
- Use Segoe UI font family

## 🔄 Development Workflow

1. Create a feature branch from main
2. Make your changes
3. Run `npm run lint` and `npm run format` before committing
4. Commit your changes (lint-staged will run automatically)
5. Push and create a pull request

## 🚀 Deployment

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📝 Contributing

1. Follow the existing code style
2. Ensure all linting checks pass
3. Write meaningful commit messages
4. Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License.
