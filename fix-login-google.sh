#!/bin/bash
sed -i 's/import { Building, Lock, Mail, ChevronRight } from '\''lucide-react'\'';/import { Building, Lock, Mail, ChevronRight } from '\''lucide-react'\'';\nimport { googleSignIn } from '\''..\/..\/lib\/firebase'\'';/g' src/pages/auth/Login.tsx
