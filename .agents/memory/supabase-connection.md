---
name: Supabase URI handling
description: Non-obvious parsing behavior for Supabase PostgreSQL connection strings in this workspace.
---

Supabase PostgreSQL URIs can arrive with reserved characters in the password that make the URI invalid for the standard URL parser. The database layer normalizes the username/password in memory when needed, while leaving the stored secret untouched.

**Why:** A valid credential can otherwise fail before any network connection is attempted, making the database appear unreachable.

**How to apply:** Keep database credentials in Replit Secrets, never in source or chat. Prefer Supabase's copied URI/pooler format, and preserve the in-memory normalization fallback if connection-string parsing is changed.