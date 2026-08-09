#!/bin/bash
awk '
  /const currentLogs = JSON\.parse\(localStorage/ {
    skip = 12
  }
  skip > 0 {
    skip--
    next
  }
  { print }
' src/pages/persuratan/PersuratanWorkspace.tsx > temp.tsx && mv temp.tsx src/pages/persuratan/PersuratanWorkspace.tsx
