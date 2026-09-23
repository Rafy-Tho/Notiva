Server running on port 5000
(node:21168) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
(Use `node --trace-warnings ...` to show where the warning was created)
prisma:error 
Invalid `prisma.user.findUnique()` invocation:


The column `User.resetToken` does not exist in the current database.
POST /api/v1/auth/register 400 722.168 ms - 89
prisma:error 
Invalid `prisma.user.findUnique()` invocation:


The column `User.resetToken` does not exist in the current database.
POST /api/v1/auth/register 400 559.776 ms - 89


