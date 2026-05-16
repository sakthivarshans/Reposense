# Contributing to RepoSense

Thank you for your interest in contributing to RepoSense! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/yourusername/reposense.git
   cd reposense
   ```
3. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Set up the development environment** (see [SETUP.md](SETUP.md))

## 📋 Development Guidelines

### Code Style

#### Python (Backend)
- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints for function parameters and return values
- Write docstrings for all functions and classes
- Maximum line length: 100 characters
- Use `black` for code formatting:
  ```bash
  pip install black
  black backend/
  ```

#### JavaScript/React (Frontend)
- Use ES6+ syntax
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks
- Use meaningful variable and function names
- Format with Prettier:
  ```bash
  npm run format
  ```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(backend): add support for private repositories

fix(frontend): resolve chat panel scroll issue

docs(readme): update installation instructions
```

### Testing

#### Backend Tests
```bash
cd backend
pytest tests/ -v
```

#### Frontend Tests
```bash
cd frontend
npm test
```

**Requirements:**
- All new features must include tests
- Maintain or improve code coverage
- All tests must pass before submitting PR

### Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Run linters** and fix any issues:
   ```bash
   # Backend
   cd backend
   flake8 .
   black --check .
   
   # Frontend
   cd frontend
   npm run lint
   ```
4. **Update CHANGELOG.md** with your changes
5. **Create a Pull Request** with a clear title and description
6. **Link related issues** in the PR description
7. **Wait for review** and address any feedback

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
```

## 🐛 Reporting Bugs

### Before Submitting a Bug Report

1. **Check existing issues** to avoid duplicates
2. **Update to the latest version** and see if the issue persists
3. **Collect information** about your environment

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Python version: [e.g., 3.9.7]
- Node version: [e.g., 18.16.0]

**Additional context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

## 📁 Project Structure

```
reposense/
├── backend/              # FastAPI backend
│   ├── main.py          # Application entry point
│   ├── routers/         # API route handlers
│   ├── services/        # Business logic
│   └── models/          # Data models
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── api/         # API client
│   └── public/          # Static assets
└── docs/                # Documentation
```

## 🔧 Development Tips

### Backend Development

1. **Use virtual environment** to isolate dependencies
2. **Enable auto-reload** during development:
   ```bash
   uvicorn main:app --reload
   ```
3. **Check API docs** at `http://localhost:8000/docs`
4. **Use environment variables** for configuration (never commit secrets)

### Frontend Development

1. **Use Vite dev server** for hot module replacement
2. **Check browser console** for errors
3. **Use React DevTools** for debugging
4. **Test responsive design** on different screen sizes

### Working with IBM Bob

1. **Monitor API usage** to stay within limits
2. **Cache results** when possible to reduce costs
3. **Test prompts** thoroughly before committing
4. **Document prompt changes** in commit messages

## 🎨 Design Guidelines

### UI/UX Principles

- **Dark theme first** - Optimize for dark mode
- **Responsive design** - Mobile, tablet, desktop
- **Accessibility** - WCAG 2.1 AA compliance
- **Performance** - Fast load times, smooth animations
- **Consistency** - Follow existing design patterns

### Component Guidelines

- **Reusable** - Create generic, reusable components
- **Props validation** - Use PropTypes or TypeScript
- **Error boundaries** - Handle errors gracefully
- **Loading states** - Show loading indicators
- **Empty states** - Handle no-data scenarios

## 📚 Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [D3.js Documentation](https://d3js.org/)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended IDE
- [Postman](https://www.postman.com/) - API testing
- [React DevTools](https://react.dev/learn/react-developer-tools) - React debugging

## 🏆 Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project documentation

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and ideas
- **Email** - your.email@example.com

## 📄 License

By contributing to RepoSense, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to RepoSense! 🎉