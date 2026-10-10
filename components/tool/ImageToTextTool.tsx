import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GlassDropzone } from '../v3/GlassDropzone';
import { GlassResultCard } from '../v3/GlassResultCard';
import { ProofStrip } from '../ui/ProofStrip';
import { ScanReveal } from './ScanReveal';
import { OCREngineClient } from '../../src/core/ocr/engineClient';
import type { OCRResult } from '../../src/core/ocr/types';
import { emptyAudit, mergeAudits, startNetworkProof, type NetworkAudit } from '../../src/core/privacy/networkProof';
import { sanitizeOcrText } from '../../utils/sanitizeOcrText';

type Phase = 'idle' | 'loading-engine' | 'reading' | 'done' | 'error';

interface Done {
  result: OCRResult;
  imageUrl: string;
  width: number;
  height: number;
  filename: string;
}

const readSize = (url: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = url;
  });

/**
 * Image-to-text tool for the top of the guide pages: viewfinder dropzone, a proof strip built from the
 * network audit of the run, then the image with every detected word outlined next to the text read.
 * Recognition runs in the in-browser worker (src/core/ocr); nothing is uploaded.
 */
export default function ImageToTextTool({ createEngine }: { createEngine?: () => OCREngineClient } = {}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<NetworkAudit | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const engineRef = useRef<OCREngineClient | null>(null);
  const urlRef = useRef<string | null>(null);
  const token = useRef(0);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      void engineRef.current?.terminate();
      engineRef.current = null;
    },
    []
  );

  const onFile = useCallback(
    async (file: File) => {
      const mine = ++token.current;
      const stale = () => mine !== token.current;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file); // browser memory only
      urlRef.current = url;
      setDone(null);
      setError(null);
      setActiveLine(null);
      setAudit(emptyAudit());
      try {
        engineRef.current ??= (createEngine ?? (() => new OCREngineClient()))();
        const engine = engineRef.current;
        const size = await readSize(url);
        if (!engine.isReady) {
          setPhase('loading-engine');
          await engine.init('eng');
          if (stale()) return;
        }
        setPhase('reading');
        const proof = startNetworkProof();
        const unsubscribe = proof.subscribe(() => !stale() && setAudit(proof.getAudit()));
        let outcome: Awaited<ReturnType<typeof engine.recognize>>;
        try {
          outcome = await engine.recognize(file);
        } finally {
          unsubscribe();
          proof.stop();
        }
        if (stale()) return;
        setAudit(mergeAudits(proof.getAudit(), outcome.network));
        setDone({
          result: outcome.result,
          imageUrl: url,
          width: size.width,
          height: size.height,
          filename: file.name.replace(/\.[^/.]+$/, '') + '-extracted.txt',
        });
        setPhase('done');
      } catch (e) {
        if (stale()) return;
        setPhase('error');
        setError((e as Error)?.message || 'Could not read that image.');
      }
    },
    [createEngine]
  );

  const busy = phase === 'loading-engine' || phase === 'reading';

  return (
    <section aria-label="Image to text tool" className="mb-10" data-testid="image-to-text-tool">
      <GlassDropzone onFileSelect={onFile} isLoading={busy} disabled={busy} onError={(m) => setError(m)} showPreview={!done && !busy ? true : false} />
      <ProofStrip audit={audit} running={phase === 'reading'} className="mt-4" />
      <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground min-h-[1.25rem]">
        {phase === 'loading-engine' && 'Loading the recognition engine from this site...'}
        {phase === 'reading' && 'Reading your image...'}
        {phase === 'done' && done && `Read ${done.result.lines.length} lines and ${done.result.words.length} words.`}
      </p>
      {error && (
        <p role="alert" className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive text-sm">
          {error}
        </p>
      )}
      {done && (
        <div className="mt-6 space-y-6">
          <ScanReveal
            imageUrl={done.imageUrl}
            width={done.width}
            height={done.height}
            words={done.result.words}
            lines={done.result.lines}
            activeLine={activeLine}
            onActiveLine={setActiveLine}
          />
          <GlassResultCard text={sanitizeOcrText(done.result.text)} filename={done.filename} />
        </div>
      )}
    </section>
  );
}
