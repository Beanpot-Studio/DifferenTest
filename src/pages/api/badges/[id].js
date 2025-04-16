import FirebaseService from '../../../lib/firebaseService';

export async function GET({ params }) {
  try {
    const { id } = params;
    
    // Get the badge using FirebaseService
    const badge = await FirebaseService.getBadge(id);
    
    if (!badge) {
      return new Response(
        JSON.stringify({
          error: 'Badge not found',
          valid: false
        }),
        { status: 404 }
      );
    }
    
    // Verify the badge data against Open Badges specification
    const requiredFields = ['@context', 'type', 'id', 'issuer', 'recipient', 'issuedOn', 'evidence'];
    const missingFields = requiredFields.filter(field => !badge[field]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(', ')}`,
          valid: false
        }),
        { status: 400 }
      );
    }

    // Verify the badge URL matches the expected pattern
    const expectedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/badges/${id}`;
    if (badge.id !== expectedUrl) {
      return new Response(
        JSON.stringify({
          error: 'Invalid badge URL',
          valid: false
        }),
        { status: 400 }
      );
    }

    // Verify the issuer URL matches the expected pattern
    const expectedIssuerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/issuers/${badge.metadata.teacherId}`;
    if (badge.issuer.id !== expectedIssuerUrl) {
      return new Response(
        JSON.stringify({
          error: 'Invalid issuer URL',
          valid: false
        }),
        { status: 400 }
      );
    }

    // If all checks pass, return the verified badge
    return new Response(
      JSON.stringify({
        valid: true,
        badge: {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          image: badge.image,
          issuer: badge.issuer,
          recipient: badge.recipient,
          issuedOn: badge.issuedOn,
          evidence: badge.evidence,
          metadata: badge.metadata
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying badge:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        valid: false
      }),
      { status: 500 }
    );
  }
} 