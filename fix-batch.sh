#!/bin/bash
awk '
  /doc\.save\(`KONSOLIDASI_BAP_PUPR_GARUT_/ {
    print "    const pageHeight = doc.internal.pageSize.getHeight();"
    print "    await addFooterWithQRCode(doc, \"BATCH_REPORT_\" + new Date().getTime(), signatureCert || \"PENDING\", pageHeight, pageWidth);"
    print $0
    next
  }
  { print }
' src/pages/report/ReportWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/report/ReportWorkspace.tsx
