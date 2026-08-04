# AI Script Parsing Setup Guide

## Overview
This guide explains how to set up GPT-4o-mini for automatic script parsing in PlotOps.

## Cost Analysis
- **Model**: GPT-4o-mini
- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens
- **Average screenplay (120 pages)**: ~$0.05-0.10 per script
- **1,000 scripts/month**: ~$50-100

## Prerequisites
1. OpenAI API account
2. OpenAI API key with billing enabled
3. pnpm or npm installed

## Step 1: Install OpenAI SDK

The openai package has already been added to `apps/web/package.json`. Install dependencies:

```bash
pnpm install
```

If installation fails, you can manually install just for the web app:

```bash
cd apps/web
npm install openai@^4.20.0
```

## Step 2: Set Up Environment Variables

### Add to `apps/web/.env.local`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Add to `.env.example`:
```env
# OpenAI API Configuration (for AI script parsing)
OPENAI_API_KEY=sk-...
```

## Step 3: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Add it to your `.env.local` file

## Step 4: Update Frontend to Call Parsing API

The API route `/api/parse-script` is already created. Update the script breakdown page to use it:

### In `apps/web/src/app/script-breakdown/page.tsx`, replace the `handleUploadScript` function:

```typescript
async function handleUploadScript() {
  if (!uploadedFile || !selectedProjectId) return
  
  try {
    setUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', uploadedFile)
    formData.append('projectId', selectedProjectId)
    
    const response = await fetch('/api/parse-script', {
      method: 'POST',
      body: formData,
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to parse script')
    }
    
    // Success!
    setShowUpload(false)
    setUploadedFile(null)
    
    // Reload scenes
    await loadScenes()
    await loadStats()
    
    // Show success message
    alert(`Successfully parsed ${result.scenesCreated} scenes from the script!`)
  } catch (err: any) {
    console.error('Failed to upload script:', err)
    setError(err.message || 'Failed to upload script')
  } finally {
    setUploading(false)
  }
}
```

## Step 5: Test the Implementation

1. Start the development server:
```bash
pnpm dev
```

2. Navigate to `/script-breakdown`
3. Select a project
4. Click "Upload Script"
5. Choose a screenplay file (.txt, .fdx, or .pdf)
6. Click "Upload & Analyze"
7. Wait for the parsing to complete (may take 10-30 seconds)
8. Scenes should appear in the breakdown table

## API Route Details

### Endpoint: `/api/parse-script`
**Method**: POST
**Content-Type**: multipart/form-data

**Request Body**:
- `file`: The script file
- `projectId`: The UUID of the project

**Response**:
```json
{
  "success": true,
  "scenesCreated": 15,
  "totalScenesParsed": 15,
  "scenes": [...]
}
```

**Error Response**:
```json
{
  "error": "Failed to parse script",
  "message": "Detailed error message"
}
```

## What the AI Parses

For each scene, the AI extracts:
- **Scene Number**: e.g., "1", "2", "3A"
- **Location**: e.g., "BANK LOBBY", "COFFEE SHOP"
- **Scene Type**: INT (interior), EXT (exterior), or INT_EXT
- **Time of Day**: day, night, dawn, dusk, or magic_hour
- **Description**: What happens in the scene
- **Characters**: Array of character names
- **Props**: Notable props mentioned
- **Complexity Rating**: 1-5 scale based on:
  - Number of characters
  - Location complexity
  - Special effects or stunts
  - Production requirements
- **Page Count**: Estimated pages (decimal allowed)
- **Script Notes**: Special production notes

## Customizing the AI Prompt

To customize how the AI parses scripts, edit the system prompt in `/apps/web/src/app/api/parse-script/route.ts`:

```typescript
{
  role: 'system',
  content: `Your custom parsing instructions here...`
}
```

## Troubleshooting

### "Cannot find module 'openai'"
Run `pnpm install` or manually install openai in apps/web

### "Invalid API key"
1. Check that OPENAI_API_KEY is set in `.env.local`
2. Verify the key starts with `sk-`
3. Restart the development server

### "Insufficient credits"
1. Go to [OpenAI Billing](https://platform.openai.com/account/billing)
2. Add payment method
3. Purchase credits ($5 minimum)

### Parsing takes too long
- Average screenplay: 10-30 seconds
- Large scripts (150+ pages): up to 60 seconds
- Consider adding a progress indicator

### Scenes not creating
1. Check browser console for errors
2. Check server logs for API errors
3. Verify project ID is valid
4. Check database connection

## Alternative AI Models

If you want to use a different model:

### Google Gemini 1.5 Flash (FREE tier)
```typescript
// Install: npm install @google/generative-ai
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
```

### Anthropic Claude 3.5 Haiku
```typescript
// Install: npm install @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})
```

## Production Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **File Size Limits**: Limit uploads to reasonable sizes (e.g., 5MB)
3. **Error Handling**: Improve error messages for users
4. **Progress Tracking**: Add real-time progress updates
5. **Queue System**: Use a job queue for large scripts
6. **Caching**: Cache parsed scripts to avoid re-parsing
7. **Monitoring**: Track API costs and usage

## Security Best Practices

1. Never commit `.env.local` to git
2. Use environment variables for API keys
3. Validate file types before uploading
4. Sanitize AI output before storing
5. Implement authentication/authorization
6. Add file size limits
7. Use secure file storage (Supabase Storage)

## Cost Optimization Tips

1. **Cache parsed scripts**: Store results to avoid re-parsing
2. **Batch processing**: Parse multiple scripts in one request
3. **Use cheaper models**: Start with gpt-4o-mini, upgrade if needed
4. **Set token limits**: Limit max_tokens to control costs
5. **Monitor usage**: Set up billing alerts in OpenAI dashboard
6. **Compress prompts**: Remove unnecessary instructions

## Next Steps

1. ✅ Install OpenAI SDK
2. ✅ Set up API key
3. ✅ Update frontend handler
4. Test with sample screenplay
5. Adjust AI prompt for better accuracy
6. Add character and prop extraction
7. Implement progress tracking
8. Add error recovery
9. Deploy to production

## Support

For issues:
1. Check the [OpenAI documentation](https://platform.openai.com/docs)
2. Review server logs
3. Test with the OpenAI playground first
4. Check the PlotOps repository issues
