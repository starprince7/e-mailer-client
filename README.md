# Modern Email Client

A production-ready email client application built with Next.js 16, TypeScript, and the Resend API. Send professional emails with rich text editing, file attachments, and customizable templates.

![Email Client](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### Core Functionality
- 📧 **Send Emails** - Send professional emails using Resend API
- ✍️ **Rich Text Editor** - Format your emails with a full-featured editor
- 📎 **File Attachments** - Attach files up to 25MB total
- 👥 **Multiple Recipients** - Send to multiple recipients with CC and BCC support
- 📋 **Email Templates** - Pre-built templates for common use cases
- ⚙️ **Settings Panel** - Easy API key configuration with validation

### Technical Features
- 🔒 **Secure API Integration** - Server-side API routes with rate limiting
- ✅ **Form Validation** - Robust email and input validation with Zod
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and Radix UI
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Dark Mode** - Automatic dark mode support
- 🔔 **Toast Notifications** - User-friendly success and error messages
- ⚡ **Performance** - Optimized with Next.js 16 and React 19

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- A Resend account ([Sign up here](https://resend.com))

### Installation

1. **Clone and Install**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Configure Environment**
   
   Create `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   FROM_EMAIL=your-email@yourdomain.com
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open Application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see [SETUP.md](SETUP.md).

## 📖 Usage

### Setting Up Resend API

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to **API Keys** → **Create API Key**
3. Copy your API key
4. In the app, click **Settings** and paste your API key
5. Click **Save & Validate**

### Sending Your First Email

1. Click **Compose** in the sidebar
2. Enter recipient email(s) in the **To** field
3. Add a subject and compose your message
4. (Optional) Use a template or attach files
5. Click **Send Email**

## 🏗️ Project Structure

```
starprince-email-client/
├── app/
│   ├── api/
│   │   ├── send-email/        # Email sending endpoint
│   │   └── validate-api-key/  # API key validation
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Main application page
├── components/
│   ├── email/
│   │   ├── compose-form.tsx   # Email composition form
│   │   ├── email-client.tsx   # Main client component
│   │   ├── email-detail.tsx   # Email detail view
│   │   ├── email-list.tsx     # Email list component
│   │   ├── rich-text-editor.tsx # Quill editor wrapper
│   │   ├── settings-panel.tsx # Settings configuration
│   │   └── sidebar.tsx        # Navigation sidebar
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── templates.ts           # Email templates
│   ├── types.ts               # TypeScript definitions
│   ├── utils.ts               # Utility functions
│   └── validation.ts          # Zod schemas
├── middleware.ts              # API middleware
└── package.json               # Dependencies
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Rich Text**: React Quill
- **Icons**: Lucide React
- **Validation**: Zod

### Backend
- **API**: Next.js API Routes
- **Email Service**: Resend SDK
- **Rate Limiting**: In-memory implementation
- **Validation**: Zod schemas

## 🔒 Security Features

- ✅ **Environment Variables** - API keys never exposed to client
- ✅ **Rate Limiting** - 10 emails per minute per IP address
- ✅ **Input Validation** - Email addresses and form data validated
- ✅ **File Size Limits** - 25MB total attachment limit
- ✅ **API Key Validation** - Keys verified before use
- ✅ **Secure Headers** - Next.js security best practices

## 📝 API Documentation

### Send Email Endpoint

**POST** `/api/send-email`

Sends an email via Resend API with support for attachments, CC, and BCC.

**Request:**
```typescript
FormData {
  to: string          // Required, comma-separated
  cc?: string         // Optional
  bcc?: string        // Optional
  subject: string     // Required
  body: string        // Required
  html?: string       // Optional HTML version
  attachments?: File[] // Optional files
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Email sent successfully"
  }
}
```

### Validate API Key Endpoint

**POST** `/api/validate-api-key`

Validates a Resend API key.

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

## 🎨 Email Templates

Five pre-built templates included:

1. **Welcome Email** - Onboard new users
2. **Meeting Invitation** - Schedule meetings
3. **Newsletter** - Send updates and news
4. **Thank You** - Express gratitude
5. **Follow-up** - Continue conversations

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
4. Deploy!

### Other Platforms

See [SETUP.md](SETUP.md) for deployment guides for Netlify, Railway, and AWS.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/email-client/issues)

## 🙏 Acknowledgments

- [Resend](https://resend.com) for the email API
- [Next.js](https://nextjs.org) team for the framework
- [Radix UI](https://radix-ui.com) for accessible components
- [Tailwind CSS](https://tailwindcss.com) for styling

---

**Built with ❤️ using Next.js and Resend**
# e-mailer-client
