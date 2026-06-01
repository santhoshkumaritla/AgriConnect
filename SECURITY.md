# Security — secrets and git

## Never commit

- `backend/.env`
- `frontend/.env`
- Any file containing real passwords, API keys, or MongoDB connection strings

Only **`*.env.example`** belongs in git (empty placeholders, no real values).

## If GitHub reported “secret detected”

1. **Do not** add `.env` files to git.
2. **Rotate** anything that may have been exposed:
   - MongoDB Atlas → Database Access → new password
   - Gmail → revoke App Password → create new one
   - Generate new `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
3. Update **Render** and **Netlify** environment variables with new values.
4. If `.env` was ever pushed, remove it from history (see below).

## Remove `.env` from git history (if it was committed)

```powershell
cd path\to\Agri
git rm --cached backend/.env frontend/.env 2>$null
git commit -m "Stop tracking env files with secrets"
git push origin main
```

If secrets are in older commits, use [GitHub guide: removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) or `git filter-repo`.

## Local vs production

| File | Use |
|------|-----|
| `backend/.env` | Local dev only (gitignored) |
| `backend/.env.example` | Template for Render variable names |
| `frontend/.env` | Local dev only (gitignored) |
| `frontend/.env.example` | Template for Netlify variable names |
