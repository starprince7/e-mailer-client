# Email Client Setup Guide

This guide will help you set up and configure the email client application with Resend API integration.

## Prerequisites

- Node.js 18+ or Bun runtime
- A Resend account (sign up at [resend.com](https://resend.com))
- A verified domain in Resend (or use the testing domain)

## Installation

1. **Install Dependencies**

   Using npm:
   ```bash
   npm install
   ```

   Or using bun:
   ```bash
   bun install
   ```

2. **Environment Configuration**

   Create a `.env.local` file in the root directory:
   ```bash
   cp env.example.txt .env.local
   ```

   Update the values in `.env.local`:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   FROM_EMAIL=your-email@yourdomain.com
   ```

## Getting Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign up/login
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "Email Client")
5. Select permissions: **Send emails**
6. Copy the generated API key
7. Paste it in your `.env.local` file

## Domain Verification

### For Testing (No Domain Required)

You can use Resend's test domain `onboarding@resend.dev` to send test emails:
- Test emails can only be sent to verified email addresses
- Add your email in Resend dashboard under **Verified Emails**

### For Production (Custom Domain)

1. Add your domain in Resend dashboard
2. Add the provided DNS records to your domain
3. Wait for verification (usually a few minutes)
4. Use your custom email address (e.g., `hello@yourdomain.com`)

## Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   # or
   bun dev
   ```

2. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Configure API Key**
   - Click **Settings** in the sidebar
   - Enter your Resend API key
   - Click **Save & Validate**

## Usage

### Composing Emails

1. Click **Compose** in the sidebar
2. Fill in recipient details:
   - **To**: Required (comma-separated for multiple)
   - **CC**: Optional (click CC button to show)
   - **BCC**: Optional (click BCC button to show)
3. Enter subject and message
4. Optionally use email templates
5. Attach files if needed (max 25MB total)
6. Click **Send Email**

### Email Templates

Pre-built templates are available:
- Welcome Email
- Meeting Invitation
- Newsletter
- Thank You
- Follow-up

Select a template from the dropdown to auto-fill subject and body.

### Viewing Emails

- **Inbox**: Demo emails (for demonstration)
- **Sent**: Shows sent emails (mock data for now)
- Click any email to view details

## Features

### Security
- ✅ API keys stored in environment variables
- ✅ Rate limiting (10 emails per minute per IP)
- ✅ Email validation
- ✅ Secure API routes
- ✅ Local storage for API key (client-side only)

### Email Features
- ✅ Rich text editor
- ✅ File attachments
- ✅ CC and BCC fields
- ✅ Email templates
- ✅ HTML email support
- ✅ Multiple recipients

### UI/UX
- ✅ Responsive design (mobile & desktop)
- ✅ Dark mode support
- ✅ Modern interface with Tailwind CSS
- ✅ Toast notifications
- ✅ Loading states

## API Endpoints

### POST `/api/send-email`

Send an email using Resend API.

**Request:**
```typescript
FormData {
  to: string (comma-separated emails)
  cc?: string (optional)
  bcc?: string (optional)
  subject: string
  body: string
  html?: string
  attachments?: File[]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "email_id",
    "message": "Email sent successfully"
  }
}
```

### POST `/api/validate-api-key`

Validate a Resend API key.

**Request:**
```json
{
  "apiKey": "re_..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key is valid"
}
```

## Troubleshooting

### "API key is required" Error
- Make sure you've configured the API key in Settings
- Check that the key starts with `re_`
- Verify the key is active in your Resend dashboard

### "Rate limit exceeded" Error
- Wait 60 seconds before sending more emails
- Adjust `RATE_LIMIT_MAX` in `.env.local` if needed

### Emails Not Sending
- Verify your API key is correct
- Check that the FROM email is verified in Resend
- For test domain, ensure recipient is verified
- Check browser console for errors

### Module Not Found Errors
- Run `npm install` or `bun install`
- Delete `node_modules` and reinstall if issues persist
- Clear `.next` folder: `rm -rf .next`

## Production Deployment

### Environment Variables

Set these in your hosting platform:
```env
RESEND_API_KEY=your_production_key
FROM_EMAIL=noreply@yourdomain.com
```

### Recommended Platforms
- **Vercel**: Native Next.js support
- **Netlify**: Supports Next.js
- **Railway**: Easy deployment
- **AWS/DigitalOcean**: For full control

### Security Checklist

- [ ] Use environment variables for API keys
- [ ] Enable HTTPS
- [ ] Implement user authentication
- [ ] Add CSRF protection
- [ ] Set up monitoring/logging
- [ ] Configure CORS properly
- [ ] Add input sanitization
- [ ] Implement proper error handling

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues with:
- **Resend API**: [resend.com/docs](https://resend.com/docs)
- **This Application**: Check the README.md or create an issue

## Contributing

Contributions are welcome! Please feel free to submit pull requests.
