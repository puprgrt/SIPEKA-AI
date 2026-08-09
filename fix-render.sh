#!/bin/bash
sed -i 's/        ) : activeTab === '\''pengaturan'\'' ? (/        ) : activeTab === '\''pengaturan'\'' ? (\n          <PengaturanKopSurat \/>\n        ) : activeTab === '\''audit_trail'\'' ? (\n          <AuditTrail \/>\n        ) : activeTab === '\''verifikasi'\'' ? (\n          <QRScanner \/>/g' src/pages/persuratan/PersuratanWorkspace.tsx
