# Vercel Deployment Instructions

## Environment Variables for Vercel

When deploying to Vercel, you need to set the following environment variables in your Vercel dashboard:

### Required Environment Variables:

1. **NEXT_PUBLIC_API_BASE_URL**
   - Value: `http://3.37.138.131:8000`
   - Description: The base URL for the API server

### How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variable:
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `http://3.37.138.131:8000`
   - Environment: Production (and Preview if needed)

## API Configuration

The application automatically detects the environment:

- **Development**: Uses proxy configuration (`/api/proxy`)
- **Production**: Uses direct API URL from `NEXT_PUBLIC_API_BASE_URL`

## Common Issues and Solutions

### Issue: API calls fail in production but work locally

**Solution**: Ensure the `NEXT_PUBLIC_API_BASE_URL` environment variable is set in Vercel.

### Issue: CORS errors in production

**Solution**: The API server must have CORS configured to allow requests from your Vercel domain.

### Issue: Environment variables not loading

**Solution**: 
1. Ensure you're using `NEXT_PUBLIC_` prefix for client-side variables
2. Redeploy after setting environment variables
3. Check Vercel function logs for debugging

## Debugging in Production

The application includes console logs that help debug API issues:
- Check browser console for API request URLs and responses
- Check Vercel function logs in the dashboard

## API Endpoints Used

- `GET /post-list` - Get all posts
- `POST /my-post-list` - Get user's posts (used by profile and my-posts pages)
- `GET /post-by-category` - Get posts by category
- `POST /post-upload` - Upload new post
- `GET /get-post` - Get specific post
