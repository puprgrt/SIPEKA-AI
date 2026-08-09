#!/bin/bash
cat << 'INNER_EOF' > temp.tsx
              <div className="space-y-2">
                <SignatureCanvas ref={sigCanvas} />
              </div>
INNER_EOF

sed -i '/<div className="space-y-2">/,/<\/div>/ {
  /<SignatureCanvas ref={sigCanvas} \/>/! {
    /<div className="space-y-2">/!d
  }
}' src/pages/persuratan/PersuratanWorkspace.tsx
