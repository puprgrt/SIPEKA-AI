#!/bin/bash
sed -i 's/const exportToPDF = (survey: SurveyItem) => {/const exportToPDF = async (survey: SurveyItem) => {/g' src/pages/survey/SurveyList.tsx
awk '
  /doc\.save\(`Berkas_Permohonan_\${survey\.id}\.pdf`\);/ {
    print "    const pageHeight = doc.internal.pageSize.getHeight();"
    print "    await addFooterWithQRCode(doc, survey.id, \"PENDING\", pageHeight, pageWidth);"
    print $0
    next
  }
  { print }
' src/pages/survey/SurveyList.tsx > temp.tsx && mv temp.tsx src/pages/survey/SurveyList.tsx
