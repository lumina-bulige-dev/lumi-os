# Contributing to LUMI OS

Thank you for contributing to LUMI OS! This document provides guidelines for contributing to this repository.

## Setup

To configure your local git to use the commit message template:

```bash
# Make the setup script executable (first time only)
chmod +x setup-git-template.sh

# Run the setup script
./setup-git-template.sh
```

After running this script, your git commits will automatically use the template defined in `.gitmessage`.

## Commit Message Format

To maintain consistency and clarity in the project history, all commit messages should follow this format:

### Structure

```
<type>: <subject>

[optional body]

[optional footer]
```

### Type

The type should be one of the following:

- **Add**: Add new features, files, or functionality
- **Update**: Modify existing features or content
- **Fix**: Bug fixes or corrections
- **Refactor**: Code changes that neither fix bugs nor add features
- **Remove**: Remove code, features, or functionality
- **Delete**: Delete entire files or directories (use Remove for code-level deletions)
- **Create**: Initialize new components or pages
- **Implement**: Add implementation for planned features
- **Define**: Add type definitions or interfaces
- **Import**: Add import statements or dependencies
- **Move**: Relocate files or restructure code
- **Rename**: Change names of files, variables, or functions
- **Format**: Code formatting changes
- **Simplify**: Simplify code without changing functionality
- **Modify**: Minor modifications
- **Uncomment**: Enable previously commented code
- **Exclude**: Exclude files from configurations

### Subject

- Use imperative mood ("Add feature" not "Added feature" or "Adds feature")
- Do not capitalize the first letter after the type
- Do not end with a period
- Keep it concise (50 characters or less preferred)
- Be specific and descriptive

### Examples

Good commit messages:
```
Add tsbuildinfo to .gitignore and remove from tracking
Fix package.json formatting and dependencies order
Refactor index.ts for improved structure and CORS
Update package.json to include devDependencies
Remove unused LogItem type definitions
Create AdminPage component for admin functionalities
```

Bad commit messages:
```
Initial plan
WIP
Fixed stuff
Update
Changes
```

### Body (Optional)

- Provide additional context if the subject line is not sufficient
- Wrap at 72 characters
- Explain what and why, not how

### Footer (Optional)

- Reference issues, pull requests, or breaking changes
- Format: `Closes #123` or `Fixes #123` or `Related to #123`

## Governance

Per the canonical governance model:

- Only **A:HQ** may push canonical updates to `lumi-os`
- All classes (A/B/C/D/E) must read from the main branch
- Contributions flow: E (Deep Source) → AI_E structuring → A:HQ adoption → lumi-os (canonical)

## Questions?

For questions about contributing, please refer to the README.md or contact the repository maintainers.
