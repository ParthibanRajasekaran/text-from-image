# ⚠️ Vercel Free Tier Limits

## Deployment Limits

If you see this error:
```
Error: Resource is limited - try again in 25 minutes 
(more than 100, code: "api-deployments-free-per-day")
```

**You've hit the Vercel free tier limit of 100 deployments per day.**

### Solutions

1. **Wait 24 hours** - Limit resets daily
2. **Use Git integration** - Push to GitHub instead of CLI deploy (doesn't count toward limit)
3. **Upgrade to Pro** - https://vercel.com/pricing (unlimited deployments)

### Workaround: Use Git Auto-Deploy

Instead of `npm run deploy:prod`, commit and push your changes:

```bash
# Commit your changes
git add .
git commit -m "Update: description of changes"

# Push to main branch
git push origin main
```

Vercel will automatically deploy from GitHub (doesn't count toward CLI limit).

### Free Tier Limits (as of 2024)

| Resource | Limit |
|----------|-------|
| Deployments per day | 100 (via CLI) |
| Deployments per month | Unlimited (via Git) |
| Bandwidth | 100 GB/month |
| Serverless Function Execution | 100 GB-Hrs |
| Edge Requests | 100k/month |
| Build Minutes | 6,000/month |

### Best Practices

1. **Use Git integration for production** - Unlimited deployments
2. **Use CLI for testing** - Quick iteration during development
3. **Batch changes** - Commit multiple changes before deploying
4. **Skip non-critical deploys** - Use `[skip deploy]` in commit message

### Check Current Usage

Visit: https://vercel.com/dashboard/usage

## Alternative: Manual Git Deploy

If you hit the limit and need to deploy urgently:

```bash
# 1. Commit all changes (including uncommitted)
git add .
git commit -m "Deploy: urgent update"

# 2. Push to trigger auto-deploy
git push origin main

# 3. Monitor deployment
# Visit: https://vercel.com/dashboard
```

The deployment will happen automatically via GitHub integration.
