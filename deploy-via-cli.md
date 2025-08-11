# Deploy via Supabase CLI (Alternative Method)

If you have Supabase CLI installed, you can deploy the schema using the command line:

## Prerequisites

- Supabase CLI installed
- Logged into your Supabase account

## Steps

1. **Create a migrations folder** (if it doesn't exist):

```bash
mkdir -p supabase/migrations
```

2. **Create the migration file**:

```bash
# Copy the final-optimized-integration.sql content to:
supabase/migrations/20241220000000_projectplanner_integration.sql
```

3. **Deploy the migration**:

```bash
supabase db push
```

## Alternative: Direct SQL Execution

```bash
supabase db reset --linked
# Then copy the SQL content directly
```

## Verify Deployment

```bash
supabase db diff
```
