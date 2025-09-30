# Deployment Guide for Vercel

This guide will help you deploy the Medication Inventory React application to Vercel.

## Prerequisites

1. A Vercel account
2. Your backend API deployed and accessible
3. Firebase project configured

## Environment Variables

Before deploying, you need to set up the following environment variables in your Vercel project:

### Required Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-api.vercel.app/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Select the `MedicationInventoryReact_TS` folder as the root directory

### 2. Configure Build Settings

Vercel will automatically detect this as a Vite project. The build settings should be:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add each environment variable listed above
3. Make sure to set them for Production, Preview, and Development environments

### 4. Deploy

1. Click "Deploy" in the Vercel dashboard
2. Wait for the build to complete
3. Your app will be available at the provided Vercel URL

## Local Development

For local development, create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your local values
nano .env.local
```

## Build Optimization

The project is configured with the following optimizations:

- **Code Splitting**: Vendor, Firebase, and MUI libraries are split into separate chunks
- **Minification**: Terser minification for production builds
- **Source Maps**: Disabled for production to reduce bundle size
- **Tree Shaking**: Unused code is automatically removed

## Troubleshooting

### Common Issues

1. **Build Fails**: Check that all environment variables are set correctly
2. **API Calls Fail**: Verify the `VITE_API_BASE_URL` points to your deployed backend
3. **Firebase Errors**: Ensure all Firebase environment variables are correct
4. **Routing Issues**: The app uses client-side routing, ensure Vercel is configured to serve `index.html` for all routes

### Build Logs

Check the Vercel build logs for any errors. Common issues include:
- Missing environment variables
- TypeScript errors
- Import/export issues

## Security Notes

- Never commit `.env.local` or `.env.production` files
- Use Vercel's environment variable system for production secrets
- Ensure your Firebase configuration is properly secured
- Use HTTPS for all API calls in production

## Performance

The app is optimized for production with:
- Lazy loading of components
- Code splitting
- Optimized bundle sizes
- CDN delivery through Vercel

## Support

If you encounter issues during deployment, check:
1. Vercel documentation
2. Vite documentation
3. Firebase documentation
4. Your backend API logs
