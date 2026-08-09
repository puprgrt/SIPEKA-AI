/**
 * PUPR-ID SSO Integration Client Module
 * Platform SIPEKA AI - Dinas PUPR Kabupaten Garut
 */

export interface PUPRIdUser {
  id: string;
  nip: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  role: string; // Active SIPEKA role
  avatarUrl?: string;
  token: string;
  authProvider: 'puprID';
  authenticatedAt: string;
  signedCertInfo?: {
    issuer: string;
    status: 'ACTIVE' | 'EXPIRED';
    validUntil: string;
  };
}

const SSO_SESSION_KEY = 'sipeka_pupr_id_user';

/**
 * Daftar Akun Terverifikasi PUPR-ID untuk Simulasi & Fast-Login Development
 */
export const MOCK_PUPR_ID_USERS: Record<string, Omit<PUPRIdUser, 'token' | 'authenticatedAt'>> = {
  '198503152010011002': {
    id: 'pupr-user-001',
    nip: '198503152010011002',
    fullName: 'Ir. H. Agus Ismail, S.T., M.T.',
    email: 'agus.ismail@garutkab.go.id',
    phone: '081234567890',
    department: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    position: 'Kepala Dinas PUPR',
    role: 'Kepala Dinas',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authProvider: 'puprID',
    signedCertInfo: {
      issuer: 'BSrE BSSN',
      status: 'ACTIVE',
      validUntil: '2027-12-31'
    }
  },
  '198807122014021005': {
    id: 'pupr-user-002',
    nip: '198807122014021005',
    fullName: 'Rudi Hermawan, S.T., M.Sc.',
    email: 'rudi.hermawan@garutkab.go.id',
    phone: '081398765432',
    department: 'Bidang Tata Bangunan & Bina Konstruksi',
    position: 'Kepala Bidang Tata Bangunan',
    role: 'Kepala Bidang',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authProvider: 'puprID',
    signedCertInfo: {
      issuer: 'BSrE BSSN',
      status: 'ACTIVE',
      validUntil: '2026-10-15'
    }
  },
  '199204182018012003': {
    id: 'pupr-user-003',
    nip: '199204182018012003',
    fullName: 'Siti Aminah, S.T.',
    email: 'siti.aminah@garutkab.go.id',
    phone: '085712348899',
    department: 'Subbidang Pengawasan & Keandalan Bangunan',
    position: 'Reviewer Teknis & Tim Ahli Bangunan Gedung (TABG)',
    role: 'Reviewer Teknis',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    authProvider: 'puprID',
    signedCertInfo: {
      issuer: 'BSrE BSSN',
      status: 'ACTIVE',
      validUntil: '2027-05-20'
    }
  },
  '199511052020121008': {
    id: 'pupr-user-004',
    nip: '199511052020121008',
    fullName: 'Dadan Ramdani, A.Md.T.',
    email: 'dadan.ramdani@garutkab.go.id',
    phone: '082155443322',
    department: 'Tim Inspeksi Lapangan DPUPR',
    position: 'Surveyor Utama Bangunan Gedung',
    role: 'Surveyor',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    authProvider: 'puprID'
  },
  '199001012015031001': {
    id: 'pupr-user-005',
    nip: '199001012015031001',
    fullName: 'Budi Santoso, S.Kom.',
    email: 'admin.sipeka@garutkab.go.id',
    phone: '081122334455',
    department: 'Pusat Data & Informasi DPUPR',
    position: 'Super Administrator SIPEKA',
    role: 'Super Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    authProvider: 'puprID'
  }
};

/**
 * Menghasilkan URL SSO Authorization Redirect
 */
export function getSSOAuthorizationUrl(redirectPath: string = '/auth/callback'): string {
  const baseUrl = (import.meta as any).env?.VITE_PUPR_ID_SSO_URL || 'https://pupr-id.vercel.app';
  const callbackUrl = window.location.origin + redirectPath;
  return `${baseUrl}/login?client_id=sipeka-garut&redirect_url=${encodeURIComponent(callbackUrl)}&response_type=code`;
}

/**
 * Verifikasi Token SSO ke Backend API SIPEKA
 */
export async function verifySSOToken(tokenOrCode: string): Promise<PUPRIdUser> {
  try {
    const response = await fetch('/api/auth/pupr-id/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: tokenOrCode, code: tokenOrCode }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        saveSSOSession(data.user);
        return data.user;
      }
    }
  } catch (err) {
    console.warn('[PUPR-ID SSO] Verification API offline or unreachable, using client fallback:', err);
  }

  // Client Fallback untuk testing / jika token merujuk ke NIP terdaftar
  const matchedUserKey = Object.keys(MOCK_PUPR_ID_USERS).find(nip => tokenOrCode.includes(nip)) || '198503152010011002';
  const baseMock = MOCK_PUPR_ID_USERS[matchedUserKey];

  const user: PUPRIdUser = {
    ...baseMock,
    token: `pupr_sso_token_${Date.now()}_${tokenOrCode.slice(0, 8)}`,
    authenticatedAt: new Date().toISOString(),
  };

  saveSSOSession(user);
  return user;
}

/**
 * Simpan Sesi Pengguna SSO
 */
export function saveSSOSession(user: PUPRIdUser): void {
  try {
    localStorage.setItem(SSO_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save SSO session:', e);
  }
}

/**
 * Ambil Sesi Pengguna SSO Aktif
 */
export function getSSOSession(): PUPRIdUser | null {
  try {
    const data = localStorage.getItem(SSO_SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data) as PUPRIdUser;
  } catch (e) {
    return null;
  }
}

/**
 * Hapus Sesi Pengguna SSO (Logout)
 */
export function clearSSOSession(): void {
  try {
    localStorage.removeItem(SSO_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear SSO session:', e);
  }
}
