#!/bin/bash
awk '
  /allowedTabs = \[/ {
    print $0
    next
  }
  /\];/ {
    if (in_super_admin || in_kepala) {
      print "      { id: '\''audit_trail'\'', label: '\''Riwayat TTD'\'', icon: ShieldCheck },"
      print "      { id: '\''verifikasi'\'', label: '\''Verifikasi QR'\'', icon: ScanLine },"
      in_super_admin = 0
      in_kepala = 0
    }
    print $0
    next
  }
  /if \(roleId === 1\)/ {
    in_super_admin = 1
    print $0
    next
  }
  /else if \(roleId === 2 || roleId === 6\)/ {
    in_kepala = 1
    print $0
    next
  }
  { print }
' src/pages/persuratan/PersuratanWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/persuratan/PersuratanWorkspace.tsx
