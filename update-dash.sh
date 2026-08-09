#!/bin/bash
sed -i 's/<h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard<\/h1>/<h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">SIPEKA <span className="text-garut-orange">Garut<\/span> Dashboard<\/h1>/g' src/pages/Dashboard.tsx
sed -i 's/<Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue\/5">/<Badge variant="outline" className="border-garut-orange text-garut-orange bg-garut-orange\/10 font-bold dark:border-garut-orange\/50">/g' src/pages/Dashboard.tsx
