# Changesets Workflow

This repository uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation.

## What are Changesets?

Changesets are a way to manage versions and changelogs in monorepos or single-package repositories. They allow contributors to declare version bumps and describe changes in a simple markdown format.

## Workflow

### 1. Making Changes

When you make a change that should be included in the next release:

```bash
npm run changeset
```

This command will:
- Ask which packages should be versioned (major, minor, or patch)
- Prompt you to write a summary of your changes
- Create a markdown file in `.changeset/` directory

### 2. Version Bumping

When ready to release, run:

```bash
npm run version
```

This command will:
- Consume all changesets in `.changeset/`
- Update package versions in `package.json`
- Update or create `CHANGELOG.md` files
- Delete the consumed changeset files

### 3. Publishing (if applicable)

To publish packages to npm:

```bash
npm run release
```

## Example Changeset File

Changeset files look like this:

```markdown
---
"lumi-os": patch
---

Fix bug in user authentication flow
```

## Version Types

- **patch**: Bug fixes and minor updates (1.0.0 → 1.0.1)
- **minor**: New features that are backward compatible (1.0.0 → 1.1.0)
- **major**: Breaking changes (1.0.0 → 2.0.0)

## Configuration

Changesets configuration is stored in `.changeset/config.json`. Current settings:
- Base branch: `copilot/update-react-router-commit-reference`
- Changelog format: `@changesets/cli/changelog`
- Access: `restricted` (private packages)

## References

- [Changesets GitHub](https://github.com/changesets/changesets)
- [Changesets Documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [React Router Example](https://github.com/remix-run/react-router/commit/26653a6bcbf8a9c5541f99dcfb526eafadf13434)
