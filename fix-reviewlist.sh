#!/bin/bash
sed -i 's/const exportBapPDF = (item: AssessmentReviewItem) => {/const exportBapPDF = async (item: AssessmentReviewItem) => {/g' src/pages/assessment/AssessmentReviewList.tsx
awk '
  /doc\.save\(`BAP_Penilaian_\${item\.id}\.pdf`\);/ {
    print "    const pageHeight = doc.internal.pageSize.getHeight();"
    print "    await addFooterWithQRCode(doc, item.id, \"PENDING\", pageHeight, pageWidth);"
    print $0
    next
  }
  { print }
' src/pages/assessment/AssessmentReviewList.tsx > temp.tsx && mv temp.tsx src/pages/assessment/AssessmentReviewList.tsx
