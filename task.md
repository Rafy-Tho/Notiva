# Backend Code Style & Naming Audit

You are a senior backend engineer reviewing an existing backend codebase.

Your task is to audit and improve the backend's **code style, naming consistency, readability, and coding conventions** without changing application behavior.

## Objective

Improve:

- Code consistency
- Naming
- Readability
- Formatting
- Developer experience
- Searchability
- Maintainability

Do not perform unrelated refactoring.

## Inspect First

Before changing anything, inspect:

- Existing coding style
- ESLint configuration
- Prettier configuration, if present
- Naming conventions
- File naming
- Function naming
- Variable naming
- Database naming
- API naming
- Error-message style
- Import ordering
- Export conventions
- Async/await patterns
- Existing comments

Determine the conventions already used by the project.

## Naming Rules

Review:

- Files
- Folders
- Functions
- Variables
- Constants
- Classes
- Services
- Controllers
- Repositories
- Middleware
- Routes
- Database fields
- API fields

Names should be:

- Clear
- Consistent
- Descriptive
- Domain-oriented
- Searchable

Avoid vague names such as:

```text
data
item
thing
helper
manager
misc
temp
obj
result
process
```

Do not rename something merely for personal preference if the existing name is already clear and consistent.

## Code Style

Check for:

- Inconsistent formatting
- Inconsistent quote usage
- Inconsistent semicolons
- Inconsistent indentation
- Inconsistent import style
- Inconsistent async patterns
- Inconsistent error handling
- Inconsistent function declarations
- Unnecessary comments
- Commented-out code
- Unused imports
- Unused variables

Follow the project's existing formatter/linter configuration.

Do not introduce a new formatting system unless required.

## Complexity

Identify:

- Excessive nesting
- Long functions
- Complex conditionals
- Repeated expressions
- Difficult-to-understand code

Only simplify code when readability improves without changing behavior.

## Spelling

Check spelling in:

- Identifiers
- Error messages
- Comments
- API fields
- Logs
- Documentation

Do not rename public API fields or database fields solely for spelling without checking compatibility.

## Verification

Run:

```text
lint
tests
```

Verify that behavior has not changed.

## Final Report

Report:

- Naming problems found
- Style problems found
- Changes made
- Files changed
- Any intentionally unchanged inconsistent code
- Lint result
- Test result

Do not mix this task with security, performance, or API redesign.

**Inspect → Identify → Fix → Verify → Report.**
