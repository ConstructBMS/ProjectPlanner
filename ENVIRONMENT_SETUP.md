# Environment Setup Guide

## Supabase Configuration

The application uses Supabase for backend services. For development, you have two options:

### Option 1: Use Mock Client (Recommended for Development)

The application will automatically use a mock Supabase client if environment variables are not configured. This allows you to develop and test the frontend without setting up a Supabase project.

### Option 2: Configure Real Supabase (For Full Functionality)

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here
```

## Development Server

The development server runs on `http://localhost:5173` and will automatically reload when you make changes.

## Current Status

✅ Development server running
✅ Mock Supabase client configured
✅ Favicon added
✅ All syntax errors resolved

The application is ready for development!
