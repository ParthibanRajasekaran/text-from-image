import React, { useCallback, useState } from 'react';
import { GlassDropzone } from '../v3/GlassDropzone';
import { GlassProgressBar } from '../v3/GlassProgressBar';
import { GlassResultCard } from '../v3/GlassResultCard';
import { ProofStrip } from '../ui/ProofStrip';
import { useOCRProcessor } from '../../hooks/useOCRProcessor';
import { emptyAudit, startNetworkProof, type NetworkAudit } from '../../src/core/privacy/networkProof';

/**
 * Slim image-to-text tool for the top of the guide pages: dropzone, progress, result and a
 * proof strip built from the network audit of the run. No hero, no marketing.
 */
export default function ImageToTextTool() {
  const { imageFile, extractedText, isProcessing, error, progressStage, progressRef, handleFileSelect, setError } =
    useOCRProcessor();
  const [audit, setAudit] = useState<NetworkAudit | null>(null);

  const onFile = useCallback(
    async (file: File) => {
      setAudit(emptyAudit());
      const proof = startNetworkProof();
      const unsubscribe = proof.subscribe(() => setAudit(proof.getAudit()));
      try {
        await handleFileSelect(file);
      } finally {
        const final = proof.stop();
        unsubscribe();
        setAudit(final);
      }
    },
    [handleFileSelect]
  );

  return (
    <section aria-label="Image to text tool" className="mb-10" data-testid="image-to-text-tool">
      <GlassDropzone onFileSelect={onFile} isLoading={isProcessing} disabled={isProcessing} onError={(m) => setError(m)} />
      <ProofStrip audit={audit} running={isProcessing} className="mt-4" />
      {isProcessing && <GlassProgressBar ref={progressRef} stage={progressStage} />}
      {error && (
        <p role="alert" className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive text-sm">
          {error}
        </p>
      )}
      {extractedText && !isProcessing && (
        <div className="mt-6">
          <GlassResultCard
            text={extractedText}
            filename={(imageFile?.name.replace(/\.[^/.]+$/, '') ?? 'extracted') + '-extracted.txt'}
          />
        </div>
      )}
    </section>
  );
}
