#!/bin/bash
sed -i 's/const handleExportPDF = () => {/const handleExportPDF = async () => {/g' src/pages/assessment/AssessmentWorkspace.tsx
awk '
  /doc\.save\(`FormA_PUPR_Assessment_SRV-002\.pdf`\);/ {
    print "    const pageHeight = doc.internal.pageSize.getHeight();"
    print "    await addFooterWithQRCode(doc, \"SRV-002\", \"PENDING\", pageHeight, pageWidth);"
    print $0
    next
  }
  { print }
' src/pages/assessment/AssessmentWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/assessment/AssessmentWorkspace.tsx
