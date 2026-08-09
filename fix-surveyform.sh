#!/bin/bash
sed -i 's/const handlePrint = () => {/const handlePrint = async () => {/g' src/pages/survey/SurveyForm.tsx
awk '
  /doc\.save\(filename\);/ {
    print "      const pageHeight = doc.internal.pageSize.getHeight();"
    print "      await addFooterWithQRCode(doc, formData.buildingId || \"SRV-\" + Math.floor(Math.random() * 1000), \"PENDING\", pageHeight, pageWidth);"
    print $0
    next
  }
  { print }
' src/pages/survey/SurveyForm.tsx > temp.tsx && mv temp.tsx src/pages/survey/SurveyForm.tsx
