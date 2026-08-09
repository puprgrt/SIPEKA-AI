import { DigitalSignatureProvider, CertificateInfo, SignatureResponse, ValidationResponse } from './Provider';

export class MockPSrEAdapter implements DigitalSignatureProvider {
  private mockCerts = new Map<string, CertificateInfo>();
  
  constructor() {
    // Seed with a mock certificate for development
    this.mockCerts.set('mock-user-1', {
      serialNumber: 'SN-MOCK-' + Date.now(),
      subject: 'Mock Penandatangan',
      issuer: 'Mock PSrE Indonesia',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      publicKey: 'mock-public-key',
      fingerprint: 'mock-fingerprint-1234'
    });
  }

  async getCertificate(userId: string): Promise<CertificateInfo | null> {
    console.log(`[MockPSrE] Fetching certificate for user ${userId}`);
    // For demo purposes, we will return a generic cert if not found
    if (!this.mockCerts.has(userId)) {
      return {
        serialNumber: 'SN-MOCK-' + Math.floor(Math.random() * 1000000),
        subject: `Pegawai ${userId.substring(0, 5)}`,
        issuer: 'Mock PSrE SIPEKA',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        publicKey: 'mock-pub-key-' + userId,
        fingerprint: 'mock-fp-' + userId
      };
    }
    return this.mockCerts.get(userId) || null;
  }

  async signDocument(documentHash: string, userId: string, options?: any): Promise<SignatureResponse> {
    console.log(`[MockPSrE] Signing document hash ${documentHash} for user ${userId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const cert = await this.getCertificate(userId);
    if (!cert) {
      throw new Error('Certificate not found for user');
    }

    // Generate a mock signature value based on the hash
    const signatureValue = Buffer.from(`${documentHash}-signed-by-${userId}`).toString('base64');

    return {
      signatureValue,
      signedHash: documentHash,
      certificateInfo: cert,
      timestamp: new Date()
    };
  }

  async validateSignature(signatureValue: string, documentHash: string): Promise<ValidationResponse> {
    console.log(`[MockPSrE] Validating signature`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple mock validation logic
    const decoded = Buffer.from(signatureValue, 'base64').toString('utf-8');
    const isDocumentIntact = decoded.startsWith(documentHash);
    
    return {
      isValid: isDocumentIntact,
      isCertificateValid: true,
      isDocumentIntact,
      isTimestampValid: true,
      isRevoked: false,
      details: {
        method: 'MockValidation',
        decodedSignature: decoded
      }
    };
  }

  async checkRevocationStatus(serialNumber: string): Promise<{ isRevoked: boolean; reason?: string | undefined; }> {
    console.log(`[MockPSrE] Checking revocation status for ${serialNumber}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      isRevoked: false
    };
  }
}
