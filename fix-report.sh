#!/bin/bash
awk '
  /doc\.save\(`Dokumen_PUPR_\${activeBuilding\.id}_\${activeTemplate}\.pdf`\);/ {
    print "    const pageHeight = doc.internal.pageSize.getHeight();"
    print "    await addFooterWithQRCode(doc, activeBuilding.id, signatureCert || \"PENDING\", pageHeight, pageWidth);"
    print $0
    next
  }
  { print }
' src/pages/report/ReportWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/report/ReportWorkspace.tsx
