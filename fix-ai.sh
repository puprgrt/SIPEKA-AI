#!/bin/bash
sed -i 's/const handleExportPDF = () => {/const handleExportPDF = async () => {/g' src/pages/ai/AIWorkspace.tsx
awk '
  /doc\.save\(`BAP_AI_Decision_\${activeReview\.id}\.pdf`\);/ {
    print "    const pageHeight = doc.internal.pageSize.getHeight();"
    print "    await addFooterWithQRCode(doc, activeReview.id, \"PENDING\", pageHeight, pageWidth);"
    print $0
    next
  }
  { print }
' src/pages/ai/AIWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/ai/AIWorkspace.tsx
