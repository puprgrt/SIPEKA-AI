#!/bin/bash
sed -i 's/const handleExportPDF = () => {/const handleExportPDF = async () => {/g' src/pages/gis/GISWorkspace.tsx
awk '
  /doc\.save\(`Laporan_GIS_Spasial_Garut_\${new Date\(\)\.toISOString\(\)\.split\('\''T'\''\)\[0\]}\.pdf`\);/ {
    print "    const pageHeight = doc.internal.pageSize.getHeight();"
    print "    const pageWidth = doc.internal.pageSize.getWidth();"
    print "    await addFooterWithQRCode(doc, \"GIS-\" + new Date().getTime(), \"PENDING\", pageHeight, pageWidth);"
    print $0
    next
  }
  { print }
' src/pages/gis/GISWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/gis/GISWorkspace.tsx
