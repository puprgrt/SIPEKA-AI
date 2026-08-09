export interface CertificateInfo {
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  publicKey: string;
  fingerprint: string;
}

export interface SignatureResponse {
  signatureValue: string;
  signedHash: string;
  certificateInfo: CertificateInfo;
  timestamp?: Date;
}

export interface ValidationResponse {
  isValid: boolean;
  isCertificateValid: boolean;
  isDocumentIntact: boolean;
  isTimestampValid: boolean;
  isRevoked: boolean;
  details: any;
}

export interface DigitalSignatureProvider {
  /**
   * Mengambil informasi sertifikat pengguna dari PSrE
   */
  getCertificate(userId: string): Promise<CertificateInfo | null>;

  /**
   * Mengirim permohonan tanda tangan dokumen
   * @param documentHash Hash dari dokumen yang akan ditandatangani
   * @param userId ID pengguna yang menandatangani
   * @param options Opsi tambahan seperti MFA token
   */
  signDocument(documentHash: string, userId: string, options?: any): Promise<SignatureResponse>;

  /**
   * Validasi integritas signature dan dokumen
   */
  validateSignature(signatureValue: string, documentHash: string): Promise<ValidationResponse>;
  
  /**
   * Validasi status pencabutan sertifikat (OCSP/CRL)
   */
  checkRevocationStatus(serialNumber: string): Promise<{ isRevoked: boolean, reason?: string }>;
}
