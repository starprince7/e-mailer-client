import { EmailTemplate } from './types';

export const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    category: 'Marketing',
    subject: 'Welcome to our platform!',
    body: `<h2>Welcome aboard!</h2>
<p>We're excited to have you join our community.</p>
<p>Here are some things you can do to get started:</p>
<ul>
  <li>Complete your profile</li>
  <li>Explore our features</li>
  <li>Connect with other users</li>
</ul>
<p>If you have any questions, feel free to reach out to our support team.</p>
<p>Best regards,<br>The Team</p>`,
  },
  {
    id: '2',
    name: 'Meeting Invitation',
    category: 'Business',
    subject: 'Meeting Invitation',
    body: `<h3>You're Invited to a Meeting</h3>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Time:</strong> [Time]</p>
<p><strong>Location:</strong> [Location/Meeting Link]</p>
<p><strong>Agenda:</strong></p>
<ul>
  <li>[Topic 1]</li>
  <li>[Topic 2]</li>
  <li>[Topic 3]</li>
</ul>
<p>Please confirm your attendance.</p>
<p>Best regards,<br>[Your Name]</p>`,
  },
  {
    id: '3',
    name: 'Newsletter',
    category: 'Marketing',
    subject: 'Monthly Newsletter - [Month]',
    body: `<h2>This Month's Highlights</h2>
<p>Here's what's new and exciting:</p>
<h3>Feature Updates</h3>
<p>[Describe new features or updates]</p>
<h3>Community Spotlight</h3>
<p>[Highlight community achievements or stories]</p>
<h3>Upcoming Events</h3>
<p>[List upcoming events or webinars]</p>
<p>Stay connected,<br>The Team</p>`,
  },
  {
    id: '4',
    name: 'Thank You',
    category: 'Customer Service',
    subject: 'Thank you!',
    body: `<h3>Thank You!</h3>
<p>We wanted to take a moment to express our gratitude for your support.</p>
<p>Your feedback and engagement mean the world to us and help us improve our services.</p>
<p>We look forward to continuing to serve you.</p>
<p>Warm regards,<br>The Team</p>`,
  },
  {
    id: '5',
    name: 'Follow-up',
    category: 'Business',
    subject: 'Following up on our conversation',
    body: `<p>Hi [Name],</p>
<p>I wanted to follow up on our recent conversation about [topic].</p>
<p>As discussed, the next steps would be:</p>
<ol>
  <li>[Step 1]</li>
  <li>[Step 2]</li>
  <li>[Step 3]</li>
</ol>
<p>Please let me know if you have any questions or if there's anything else you need from me.</p>
<p>Looking forward to hearing from you.</p>
<p>Best regards,<br>[Your Name]</p>`,
  },
];
