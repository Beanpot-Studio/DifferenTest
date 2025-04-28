import type { APIRoute } from 'astro';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Mark this endpoint as server-rendered
export const prerender = false;

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: import.meta.env.PUBLIC_MAILGUN_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const data = await request.json();
    const { name, email, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          message: 'Missing required fields',
        }),
        { 
          status: 400,
          headers
        }
      );
    }

    // Send email using Mailgun
    const result = await mg.messages.create(import.meta.env.PUBLIC_MAILGUN_DOMAIN, {
      from: `Contact Form <noreply@${import.meta.env.PUBLIC_MAILGUN_DOMAIN}>`,
      to: import.meta.env.PUBLIC_MAILGUN_CONTACT_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,
    });

    return new Response(
      JSON.stringify({
        message: 'Email sent successfully',
      }),
      { 
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500,
        headers
      }
    );
  }
}; 