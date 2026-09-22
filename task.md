Refactor the email-sending implementation to use Hostinger's email API instead of Brevo.

Requirements:

- Remove the Brevo API key and Brevo-specific email-sending code.
- Add support for the Hostinger API key using an environment variable.
- Keep the existing email functionality, templates, recipients, and application behavior unchanged.
- Update the email service to call Hostinger's API.
- Update `.env.example` with the new Hostinger environment variables.
- Remove unused Brevo dependencies/imports.
- Do not expose API keys in source code.
- Update any relevant documentation/configuration.
- Keep the refactor minimal and production-ready.

Before changing code, inspect the existing email service and identify all Brevo-related usage.
