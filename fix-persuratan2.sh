#!/bin/bash
awk '
  /<div className="flex items-center justify-between">/ {
    skip = 1
    print "                <SignatureCanvas ref={sigCanvas} />"
    next
  }
  /<\/div>/ && skip {
    div_count++
    if (div_count == 3) {
      skip = 0
    }
    next
  }
  skip { next }
  { print }
' src/pages/persuratan/PersuratanWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/persuratan/PersuratanWorkspace.tsx
