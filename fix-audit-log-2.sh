#!/bin/bash
awk '
  /await new Promise\(resolve => setTimeout\(resolve, 1500\)\);/ {
    print $0
    print "                    const currentLogs = JSON.parse(localStorage.getItem('\''sipeka_signature_audit'\'') || '\''[]'\'');"
    print "                    const newLog: AuditLog = {"
    print "                      id: \"AUDIT-\" + new Date().getTime(),"
    print "                      nomorSurat: selectedSuratTTD.nomor,"
    print "                      hal: selectedSuratTTD.hal,"
    print "                      signerId: \"USR-\" + roleId,"
    print "                      signerName: currentRoleObj?.name || \"Unknown User\","
    print "                      timestamp: new Date().toISOString(),"
    print "                      hash: hashHex,"
    print "                      version: 1"
    print "                    };"
    print "                    localStorage.setItem('\''sipeka_signature_audit'\'', JSON.stringify([newLog, ...currentLogs]));"
    next
  }
  { print }
' src/pages/persuratan/PersuratanWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/persuratan/PersuratanWorkspace.tsx
