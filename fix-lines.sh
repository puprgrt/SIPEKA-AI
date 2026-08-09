#!/bin/bash
sed -i '270,273c\
              <div className="space-y-2">\
                <SignatureCanvas ref={sigCanvas} />\
              </div>\
              <div className="space-y-2">\
                <label className="text-sm font-medium text-slate-700">Passphrase TTE</label>\
                <Input \
                  type="password" \
                  placeholder="Masukkan passphrase sertifikat Anda..." \
                  id="tte-passphrase"\
                />\
              </div>' src/pages/persuratan/PersuratanWorkspace.tsx
