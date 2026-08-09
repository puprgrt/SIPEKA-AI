#!/bin/bash
sed -i 's/import SignatureCanvas from '\''react-signature-canvas'\'';/import { SignatureCanvas, SignatureCanvasRef } from '\''@\/components\/ui\/signature-canvas'\'';/g' src/pages/persuratan/PersuratanWorkspace.tsx
sed -i 's/const sigCanvas = useRef<SignatureCanvas>(null);/const sigCanvas = useRef<SignatureCanvasRef>(null);/g' src/pages/persuratan/PersuratanWorkspace.tsx
