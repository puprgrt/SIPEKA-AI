#!/bin/bash
sed -i 's/const exportAIDecisionPDF = () => {/const exportAIDecisionPDF = async () => {/g' src/pages/ai/AIWorkspace.tsx
sed -i 's/const exportDraftReportPDF = () => {/const exportDraftReportPDF = async () => {/g' src/pages/ai/AIWorkspace.tsx
