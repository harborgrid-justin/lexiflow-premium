# LexiFlow AI Integration Setup Guide

## Overview
LexiFlow supports multiple AI providers for advanced legal intelligence features. You can choose between **Google Gemini** (default) and **OpenAI GPT-4** for:
- Document analysis and risk scoring
- Legal research with search grounding
- Contract review and clause analysis
- AI-powered case data extraction from XML/text
- Brief critique and citation validation
- Document drafting and generation

## Supported AI Providers

### 🌟 Google Gemini API (Default)

**Model:** gemini-2.0-flash-exp (fast, cost-effective)

**Free Tier:**
- 60 requests per minute
- 1500 requests per day
- 1M tokens per day

**How to Get API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 🚀 OpenAI API (Alternative)

**Models:** GPT-4o (advanced analysis), GPT-4o-mini (fast responses)

**Pricing:** Pay-as-you-go (requires credit card)
- GPT-4o: $5.00/1M input tokens
- GPT-4o-mini: $0.15/1M input tokens

**How to Get API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Add payment method
4. Click "Create new secret key"
5. Copy the generated key

## Switching Between Providers

You can switch AI providers at any time:

1. **In the Case Importer:**
   - Enable "AI-Powered Extraction" toggle
   - Use the "Provider" dropdown to select Gemini or OpenAI
   - Your choice is saved in localStorage

2. **Via Console:**
   ```javascript
   // Check current provider
   localStorage.getItem('ai_provider')
   
   // Switch to Gemini
   localStorage.setItem('ai_provider', 'gemini')
   
   // Switch to OpenAI
   localStorage.setItem('ai_provider', 'openai')
   ```

## Installation Methods

### Method 1: Environment Variables (Recommended)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` and add your API keys:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...your_actual_key_here
   VITE_OPENAI_API_KEY=sk-...your_actual_key_here
   ```

4. Restart the development server:
   ```bash
   npm run dev
   ```

### Method 2: Browser LocalStorage (Runtime)

1. Open your browser's DevTools (F12)
2. Go to the Console tab
3. Execute the following commands:

```javascript
// Set Google Gemini API Key
localStorage.setItem('gemini_api_key', 'AIzaSy...your_actual_key_here');

// Set OpenAI API Key (optional)
localStorage.setItem('openai_api_key', 'sk-...your_actual_key_here');
```

4. Refresh the page

## Verification

### Check if Keys are Loaded

Open DevTools Console and run:

```javascript
// Check environment variables
console.log('Gemini Key (env):', import.meta.env.VITE_GEMINI_API_KEY);

// Check localStorage
console.log('Gemini Key (storage):', localStorage.getItem('gemini_api_key'));
```

### Test AI Features

1. **Case Importer**: Navigate to Cases → Import Case
   - The AI extraction toggle should be enabled
   - Paste case data and click "Extract with AI"
   - Should see structured data extracted

2. **Document Analysis**: Upload a contract
   - Should see AI-powered risk analysis
   - Summary and risk score should appear

3. **Legal Research**: Use the research panel
   - Enter a legal query
   - Should see AI-generated responses with sources

## API Package Information

### Gemini SDK

**Package:** `@google/generative-ai`

**Installation:**
```bash
npm install @google/generative-ai
```

**Official Docs:**
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Node.js Quickstart](https://ai.google.dev/gemini-api/docs/quickstart?lang=node)
- [GitHub Repository](https://github.com/google-gemini/generative-ai-js)

**Current Implementation:**
- Uses `gemini-2.0-flash-exp` model for fast, cost-effective tasks
- Supports structured JSON output with response schemas
- Implements Google Search grounding for research queries
- Streaming support for real-time content generation

### OpenAI SDK (Future Use)

**Package:** `openai`

**Installation:**
```bash
npm install openai
```

**Official Docs:**
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Node.js SDK](https://github.com/openai/openai-node)

## Model Selection

### Gemini 2.0 Flash (Current Default)
- **Model ID:** `gemini-2.0-flash-exp`
- **Best For:** Fast, cost-effective general tasks
- **Use Cases:**
  - Document analysis
  - Contract review
  - Time entry refinement
  - Intent recognition
  - Docket parsing
  - Legal research
  - Message drafting

### Model Configuration

All models support:
- **JSON Mode:** Structured outputs with response schemas
- **Google Search:** Grounded research with source attribution
- **Streaming:** Real-time content generation
- **Function Calling:** Tool integration (planned)

## Cost Optimization

### Free Tier Limits
- **Requests per minute:** 60
- **Requests per day:** 1,500
- **Tokens per day:** 1,000,000

### Best Practices
1. **Cache Results:** Consider caching frequent queries
2. **Batch Processing:** Group similar requests
3. **Fallback Logic:** Graceful degradation when API unavailable
4. **Rate Limiting:** Implement request queues for high-volume operations

## Troubleshooting

### Common Issues

**1. "Gemini API key not configured" Error**
- Ensure `.env` file exists in `/frontend` directory
- Check that key starts with `AIzaSy`
- Verify environment variable is prefixed with `VITE_`
- Restart dev server after adding key

**2. "API key not found, falling back to rule-based extraction"**
- Check browser console for key presence
- Try localStorage method if env vars don't work
- Ensure no typos in key

**3. Rate Limit Errors**
- Free tier limit: 60 requests/minute
- Implement retry logic with exponential backoff
- Consider upgrading to paid tier for production

**4. Network Errors**
- Check internet connection
- Verify no firewall blocking `generativelanguage.googleapis.com`
- Check browser console for CORS errors

### Getting Help

- **Gemini Issues:** [Google AI Forum](https://discuss.ai.google.dev/)
- **Application Issues:** Check browser console logs
- **API Status:** [Google Cloud Status](https://status.cloud.google.com/)

## Security Best Practices

### DO
✅ Use environment variables for API keys
✅ Add `.env` to `.gitignore`
✅ Rotate keys regularly
✅ Use different keys for dev/prod
✅ Monitor API usage and costs

### DON'T
❌ Commit API keys to version control
❌ Share keys in public repositories
❌ Hardcode keys in source code
❌ Use production keys in development
❌ Expose keys in client-side code without restrictions

## Production Deployment

For production environments:

1. **Use Environment Variables:**
   ```bash
   export VITE_GEMINI_API_KEY=your_production_key
   ```

2. **Enable API Key Restrictions:**
   - In Google Cloud Console
   - Restrict to specific domains/IP addresses
   - Set application restrictions

3. **Monitor Usage:**
   - Track API calls and costs
   - Set up billing alerts
   - Monitor error rates

4. **Implement Backend Proxy:**
   - Consider proxying API calls through backend
   - Hide API keys from client
   - Add additional rate limiting

## Additional Resources

- [LexiFlow Documentation](./docs/)
- [Backend API Docs](./backend/README.md)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
