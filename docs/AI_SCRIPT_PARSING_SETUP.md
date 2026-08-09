# AI Script Parsing Setup Guide

## Overview
This guide explains how to set up Google Gemini 1.5 Pro for automatic script parsing in PlotOps.

## Current Model: Gemini 1.5 Pro (Premium Configuration)
- **Model**: `gemini-1.5-pro-latest`
- **Context Window**: 2M tokens (handles very long scripts with ease)
- **Temperature**: 0.1 (low for consistent, accurate parsing)
- **Max Output Tokens**: 8192 (supports detailed scene breakdowns)
- **Cost**: ~$7/1M input tokens, ~$21/1M output tokens
- **Average screenplay (120 pages)**: ~$0.20-0.40 per script
- **1,000 scripts/month**: ~$200-400

### Why Gemini 1.5 Pro?
✅ **Massive Context Window**: Can process entire feature-length scripts (150+ pages) without truncation  
✅ **Superior Accuracy**: Best-in-class scene detection and character/prop extraction  
✅ **Consistent Output**: Low temperature ensures reliable JSON formatting  
✅ **Long Output Support**: 8K token output handles complex breakdowns  
✅ **Cost-Effective**: Infrequent use makes premium pricing acceptable

## Prerequisites
1. Google AI Studio account (free to start)
2. Google Gemini API key with billing enabled
3. pnpm or npm installed

## Step 1: Install Google Generative AI SDK

The `@google/generative-ai` package has already been added to `apps/web/package.json`. Install dependencies:

```bash
pnpm install
```

If installation fails, you can manually install just for the web app:

```bash
cd apps/web
npm install @google/generative-ai
```

## Step 2: Set Up Environment Variables

### Add to `apps/web/.env.local`:
```env
GEMINI_API_KEY=your-api-key-here
```

### Add to `.env.example` (if not already there):
```env
# Google Gemini API Configuration (for AI script parsing)
GEMINI_API_KEY=your-key-here
```

## Step 3: Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the key
5. Add it to your `apps/web/.env.local` file

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

### "Cannot find module '@google/generative-ai'"
Run `pnpm install` or manually install the package in apps/web:
```bash
cd apps/web
npm install @google/generative-ai
```

### "Invalid API key" or "API key not valid"
1. Check that `GEMINI_API_KEY` is set in `apps/web/.env.local`
2. Verify you copied the entire key from Google AI Studio
3. Restart the development server (important!)
4. Ensure there are no extra spaces or quotes around the key

### "Quota exceeded" or "Insufficient credits"
1. Go to [Google Cloud Console](https://console.cloud.google.com/billing)
2. Enable billing for your project
3. Gemini 1.5 Pro is paid - ensure your billing account is active
4. Check your usage limits and quotas

### Parsing takes longer than expected
- **Average screenplay (90-120 pages)**: 15-40 seconds with Gemini 1.5 Pro
- **Long scripts (150+ pages)**: 45-90 seconds
- **Epic scripts (180+ pages)**: May take up to 2 minutes
- The improved accuracy is worth the slightly longer processing time
- Consider adding a progress indicator for better UX

### "Model not found" error
Make sure you're using `gemini-1.5-pro-latest` - this automatically uses the newest version of Gemini 1.5 Pro

### Scenes not creating
1. Check browser console for errors
2. Check server logs for API errors
3. Verify project ID is valid
4. Check database connection

## Performance Notes

### Gemini 1.5 Pro vs. Flash
The current configuration uses **Gemini 1.5 Pro** for maximum accuracy. Here's how it compares:

| Feature | Gemini 1.5 Pro (Current) | Gemini 1.5 Flash |
|---------|-------------------------|------------------|
| Accuracy | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good |
| Speed | 15-90 seconds | 5-20 seconds |
| Context Window | 2M tokens | 1M tokens |
| Cost per script | $0.20-0.40 | $0.02-0.05 |
| Best For | Production, accuracy-critical | Development, testing |

**Why we chose Pro:**
- Infrequent use means cost is not a primary concern
- Superior accuracy reduces manual corrections
- Handles very long scripts (180+ pages) without issues
- Consistent JSON output with fewer parsing errors

### Switching to Gemini 1.5 Flash (if needed)

If you want faster, cheaper parsing for development, change the model in `route.ts`:

```typescript
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash-latest",  // Change this line
  generationConfig: {
    temperature: 0.1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
});
```

## Alternative AI Models

### Anthropic Claude 3.5 Sonnet (Premium Alternative)
```typescript
// Install: npm install @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const message = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 8192,
  temperature: 0.1,
  messages: [{ role: "user", content: prompt }]
})
```

### OpenAI GPT-4o (Alternative)
```typescript
// Install: npm install openai
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.1
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

1. **Cache parsed scripts**: Store results to avoid re-parsing (saves 100% of costs on re-uploads)
2. **Consider Flash for development**: Use `gemini-1.5-flash-latest` during testing
3. **Monitor usage**: Set up billing alerts in Google Cloud Console
4. **Batch uploads**: If multiple projects need parsing, do them in one session
5. **Validate scripts first**: Check format before sending to AI to avoid wasted calls

## Next Steps

1. ✅ Gemini SDK installed
2. ✅ API key configured
3. ✅ Model upgraded to Gemini 1.5 Pro
4. Test with sample screenplay
5. Monitor accuracy and adjust prompt if needed
6. Implement progress tracking for better UX
7. Add error recovery and retry logic
8. Deploy to production

## Support

For issues:
1. Check the [Google AI documentation](https://ai.google.dev/docs)
2. Review server logs (look for Gemini API errors)
3. Test with Google AI Studio first
4. Check the PlotOps repository issues
5. Verify your Gemini API key has billing enabled
