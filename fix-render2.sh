#!/bin/bash
awk '
  /<QRScanner \/>/ {
    print $0
    getline
    next
  }
  { print }
' src/pages/persuratan/PersuratanWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/persuratan/PersuratanWorkspace.tsx
