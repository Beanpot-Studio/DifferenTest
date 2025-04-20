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
    
    // Verify the badge data against Open Badges 3.0 specification
    const requiredFields = [
      '@context',
      'type',
      'id',
      'issuer',
      'issuanceDate',
      'credentialSubject'
    ];
    
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

    // Verify the context includes required contexts
    const requiredContexts = [
      'https://www.w3.org/ns/did/v1',
      'https://www.w3.org/ns/credentials/v2',
      'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'
    ];
    
    const missingContexts = requiredContexts.filter(context => !badge['@context'].includes(context));
    
    if (missingContexts.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required contexts: ${missingContexts.join(', ')}`,
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

    // Verify the issuer has a valid verification method
    if (!badge.issuer.verificationMethod || !Array.isArray(badge.issuer.verificationMethod) || badge.issuer.verificationMethod.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid issuer verification method',
          valid: false
        }),
        { status: 400 }
      );
    }

    // Verify the credential subject has required fields
    const requiredSubjectFields = ['id', 'type', 'achievement', 'evidence'];
    const missingSubjectFields = requiredSubjectFields.filter(field => !badge.credentialSubject[field]);
    
    if (missingSubjectFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required credential subject fields: ${missingSubjectFields.join(', ')}`,
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
          type: badge.type,
          issuer: badge.issuer,
          issuanceDate: badge.issuanceDate,
          credentialSubject: badge.credentialSubject,
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