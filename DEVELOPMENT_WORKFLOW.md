# Development Workflow - ProjectPlanner

This document outlines the development workflow for the ProjectPlanner module, including automated commits, changelog updates, and GitHub integration.

## 🚀 Quick Start

### Prerequisites

- Node.js (Latest LTS)
- Git
- PowerShell (Windows)
- GitHub account with access to [ConstructBMS/ProjectPlanner](https://github.com/ConstructBMS/ProjectPlanner)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/ConstructBMS/ProjectPlanner.git
cd ProjectPlanner

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📝 Development Workflow

### 1. Daily Development Session

#### Start Development

```bash
# Start the development server
npm run dev
```

#### Make Changes

- Edit files in the `src/modules/ProgrammeManager/` directory
- The development server will automatically reload on file changes
- Test your changes in the browser at `http://localhost:5173/`

#### Save and Commit (Automated)

After making changes, use one of these commands:

```bash
# Full save with formatting, linting, commit, and push
npm run save

# Save without pushing to GitHub (for offline work)
npm run save:no-push

# Manual commit with custom message
npm run commit:ps -- -Message "Your custom commit message"

# Node.js version (cross-platform)
npm run commit
```

### 2. What Happens During Auto-Commit

The auto-commit process performs these steps automatically:

1. **Code Formatting** - Runs Prettier to format all code
2. **Linting** - Runs ESLint to check for code quality issues
3. **Git Status Check** - Detects all changed files
4. **Staging** - Adds all changes to Git staging area
5. **Commit** - Creates a commit with timestamp and file count
6. **Changelog Update** - Updates `CHANGELOG.md` with detailed change log
7. **Push to GitHub** - Pushes changes to the remote repository

### 3. Changelog Management

The `CHANGELOG.md` file is automatically updated with:

- **Timestamp** - Date and time of the commit
- **Commit Hash** - Short Git commit hash
- **File Count** - Number of files changed
- **File List** - Detailed list of all changed files
- **Status** - Git status for each file (modified, added, deleted)

### 4. Available Scripts

| Script                   | Description                      |
| ------------------------ | -------------------------------- |
| `npm run dev`            | Start development server         |
| `npm run build`          | Build for production             |
| `npm run preview`        | Preview production build         |
| `npm run lint`           | Run ESLint                       |
| `npm run lint:fix`       | Fix ESLint issues automatically  |
| `npm run format`         | Format code with Prettier        |
| `npm run save`           | Format + Lint + Commit + Push    |
| `npm run save:no-push`   | Format + Lint + Commit (no push) |
| `npm run commit:ps`      | PowerShell auto-commit script    |
| `npm run commit:no-push` | PowerShell auto-commit (no push) |
| `npm run commit`         | Node.js auto-commit script       |

## 🔧 Manual Git Operations

### Check Status

```bash
git status
```

### View Changes

```bash
git diff
```

### Manual Commit

```bash
git add .
git commit -m "Your commit message"
git push origin master
```

### View Commit History

```bash
git log --oneline
```

## 📊 Project Structure

```
projectplanner/
├── scripts/
│   ├── auto-commit.js          # Node.js auto-commit script
│   └── auto-commit.ps1         # PowerShell auto-commit script
├── src/
│   └── modules/ProgrammeManager/
│       ├── AppShell.jsx        # Main application shell
│       ├── components/
│       │   └── RibbonTabs/
│       │       ├── RibbonTabs.jsx
│       │       └── tabs/
│       │           ├── HomeTab.jsx
│       │           ├── ViewTab.jsx
│       │           └── ... (other tabs)
│       ├── context/            # React context providers
│       ├── utils/              # Utility functions
│       └── styles/             # CSS and styling files
├── CHANGELOG.md                # Auto-updated changelog
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

## 🎯 Development Guidelines

### Code Quality

- All code is automatically formatted with Prettier
- ESLint checks for code quality issues
- Pre-commit hooks ensure code quality before commits

### Commit Messages

- Auto-generated commit messages include timestamp and file count
- Custom messages can be provided using the `-Message` parameter
- All commits follow semantic versioning conventions

### File Organization

- Keep related components in the same directory
- Use descriptive file and folder names
- Follow React component naming conventions

### Testing

- Test changes in the browser before committing
- Ensure the development server runs without errors
- Check that all linting passes

## 🔄 Continuous Integration

### Pre-commit Hooks

- **Husky** automatically runs pre-commit hooks
- **lint-staged** runs ESLint and Prettier on staged files
- Commits are blocked if code quality checks fail

### Automated Workflow

1. Make changes to files
2. Run `npm run save` to automatically:
   - Format code
   - Check for linting issues
   - Commit changes
   - Update changelog
   - Push to GitHub

## 📈 Progress Tracking

### Changelog

- `CHANGELOG.md` tracks all development progress
- Each commit adds a detailed entry
- File changes are logged with status information

### GitHub Integration

- All changes are pushed to [ConstructBMS/ProjectPlanner](https://github.com/ConstructBMS/ProjectPlanner)
- Repository serves as backup and collaboration platform
- Commit history provides detailed development timeline

## 🚨 Troubleshooting

### Common Issues

#### PowerShell Execution Policy

```bash
# If you get execution policy errors, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Git Authentication

```bash
# Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### Node.js Script Issues

```bash
# If Node.js script fails, use PowerShell version
npm run commit:ps
```

#### Linting Errors

```bash
# Fix linting issues automatically
npm run lint:fix
```

### Getting Help

- Check the terminal output for error messages
- Review the `CHANGELOG.md` for recent changes
- Check GitHub repository for latest updates
- Ensure all dependencies are installed with `npm install`

## 📚 Additional Resources

- [GitHub Repository](https://github.com/ConstructBMS/ProjectPlanner)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0
**Maintainer**: ProjectPlanner Development Team
