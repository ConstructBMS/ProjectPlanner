# Repository Mirror Setup

This document explains how to set up the repository mirror for external code review.

## Overview

The mirror automatically copies the entire repository to a public read-only repository whenever changes are pushed to any branch. This allows external reviewers to access the code without requiring credentials.

## Setup Steps

### 1. Create the Mirror Repository

Create a new **public** repository on GitHub (e.g., `constructbms-mirror`).

### 2. Generate SSH Key

Generate an SSH key pair for the mirror bot:

```bash
ssh-keygen -t ed25519 -C "pp-mirror" -f pp_mirror_key
```

This creates:
- `pp_mirror_key` (private key)
- `pp_mirror_key.pub` (public key)

### 3. Configure Mirror Repository

In the mirror repository settings:

1. Go to **Settings** → **Deploy keys**
2. Click **Add deploy key**
3. Title: `PP Mirror Bot`
4. Key: Paste the contents of `pp_mirror_key.pub`
5. ✅ **Allow write access**
6. Click **Add key**

### 4. Configure Main Repository Secrets

In the main repository settings:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

#### `MIRROR_REPO_SSH`
```
git@github.com:<YOUR_ORG>/<MIRROR_REPO_NAME>.git
```

Example:
         ```
         git@github.com:napwoodconstruction/constructbms-mirror.git
         ```

#### `MIRROR_SSH_KEY`
Paste the entire contents of the `pp_mirror_key` file (the private key).

### 5. Test the Setup

1. Make a change to any file in `src/modules/ProgrammeManager/`
2. Commit and push the change
3. Check the **Actions** tab in the main repository
4. Verify the mirror repository is updated with the new files

## How It Works

### Trigger Conditions
The mirror workflow runs when:
- Any push to any branch occurs
- The workflow file itself is modified

### What Gets Mirrored
- The entire repository (excluding build artifacts and secrets)
- A `mirror-manifest.json` file containing metadata about the source commit

### Manifest File
The `mirror-manifest.json` file contains:
```json
{
  "repo": "napwoodconstruction/ConstructBMS",
  "sha": "abc123...",
  "branch": "main",
  "ts": "2024-01-15T10:30:00.000Z"
}
```

## Security Notes

- The mirror repository is **public** and **read-only**
- The entire repository is mirrored (excluding build artifacts and secrets)
- No credentials, secrets, or sensitive configuration files are included
- The SSH key has write access only to the mirror repository
- Secret guard script prevents accidental exposure of sensitive files

## Troubleshooting

### Workflow Fails
1. Check that both secrets are properly configured
2. Verify the SSH key has write access to the mirror repository
3. Ensure the mirror repository exists and is public

### Files Not Mirrored
1. Check that the file is not in the excluded list (node_modules, .env, etc.)
2. Verify the workflow file is in the correct location
3. Check the Actions tab for any error messages

### SSH Key Issues
1. Regenerate the SSH key pair if needed
2. Ensure the public key is added as a deploy key with write access
3. Verify the private key is correctly stored in the secret

## Secret Guard

The mirror workflow includes a secret guard script (`tools/mirror/secret-guard.sh`) that:

- **Blocks common secret files**: `.env`, `.npmrc`, `firebase.json`, etc.
- **Scans for API keys**: Detects common API key patterns in code
- **Fails the workflow**: If secret files are detected, preventing exposure
- **Warns about potential secrets**: Shows warnings for suspicious patterns

### Blocked File Patterns
- `.env` and `.env.*` files
- `.npmrc` files
- `firebase.json` files
- `google-services.json` files
- `GoogleService-Info.plist` files

### Detected Secret Patterns
- Google API keys (`AIza...`)
- OpenAI API keys (`sk-...`)
- Supabase keys (`supabase.co.*key`)
- Bearer tokens (`Bearer ...`)

## Maintenance

- The SSH key should be rotated periodically
- Monitor the Actions tab for any workflow failures
- Keep the mirror repository public for external access
- Review secret guard warnings regularly
