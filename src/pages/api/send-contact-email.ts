import type { APIRoute } from 'astro';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: import.meta.env.PUBLIC_MAILGUN_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
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
          headers: {
            'Content-Type': 'application/json'
          }
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
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to send email',
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 