import fs from 'fs';

let content = fs.readFileSync('src/components/survey/EvidenceGallery.tsx', 'utf8');

// Add states for uploading
const stateCode = `
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;

        // Call the API
        const response = await fetch('/api/ai/analyze-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token' // Assuming basic auth exists
          },
          body: JSON.stringify({ imageBase64: base64 })
        });

        if (!response.ok) {
          throw new Error('Failed to analyze photo');
        }

        const data = await response.json();
        
        // Add to photos array
        const newPhoto = {
          id: 'IMG-' + Date.now(),
          url: base64,
          componentName: 'Elemen Baru',
          damageSeverity: data.severity || 'Rusak Sedang',
          timestamp: new Date().toISOString(),
          surveyorName: 'Surveyor (Upload)',
          gpsCoords: { lat: -7.2, lng: 107.9, acc: 5, alt: 700, heading: 0 },
          hashIntegrity: 'new-hash-' + Date.now(),
          cracks: data.cracks ? data.cracks.map((c: any, idx: number) => ({
            id: 'crk-' + Date.now() + '-' + idx,
            type: 'retak_struktural',
            severity: c.severity || 'Sedang',
            widthMm: c.widthMm || 1.0,
            lengthCm: c.lengthCm || 10.0,
            confidence: data.confidence || 90,
            label: c.label || 'Retak',
            bbox: { x: 20, y: 20, width: 60, height: 60 } // Default bbox
          })) : []
        };

        setPhotos(prev => [newPhoto, ...prev]);
        setActivePhoto(newPhoto);
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Gagal mengunggah atau menganalisis foto.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
`;

content = content.replace('const [copiedHash, setCopiedHash] = useState(false);', 'const [copiedHash, setCopiedHash] = useState(false);\n' + stateCode);

// Add the button
const buttonCode = `
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center cursor-pointer hover:bg-slate-700/80 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <span className="text-xs text-slate-400 block mb-1">Upload & Analisis</span>
            <div className="flex justify-center items-center h-7 text-emerald-400">
              {isUploading ? <RefreshCw className="animate-spin" size={24} /> : <Upload size={24} />}
            </div>
          </div>
`;

content = content.replace('<div className="flex items-center gap-2 self-start md:self-auto">', '<div className="flex items-center gap-2 self-start md:self-auto">\n' + buttonCode);

fs.writeFileSync('src/components/survey/EvidenceGallery.tsx', content);

