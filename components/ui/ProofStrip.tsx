import React from 'react';
import type { NetworkAudit } from '../../src/core/privacy/networkProof';

interface ProofStripProps {
  /** null before any image has been read. */
  audit: NetworkAudit | null;
  running?: boolean;
  className?: string;
}

/**
 * ProofStrip: shows what the network monitor measured while an image was read.
 * Numbers come straight from the audit; nothing here is hard-coded or animated to look busy.
 */
export function ProofStrip({ audit, running = false, className = '' }: ProofStripProps) {
  const requests = audit ? audit.requests.length : 0;
  const bytes = audit ? audit.totalOutboundBytes : 0;
  const ok = audit ? audit.verifiedZeroUpload : true;

  let status: string;
  if (running) status = 'Watching the network while your image is read';
  else if (!audit) status = 'Waiting for an image. Requests are counted while it is read.';
  else if (ok) status = 'Verified: nothing was uploaded';
  else status = 'Something was sent. This should not happen, please report it.';

  return (
    <div
      data-testid="proof-strip"
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-4 py-3 font-mono text-xs sm:text-sm flex flex-wrap items-center gap-x-6 gap-y-1 ${
        ok ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-destructive/50 bg-destructive/10 text-destructive'
      } ${className}`}
    >
      <span>
        requests: <strong data-testid="proof-requests">{audit ? requests : '-'}</strong>
      </span>
      <span>
        bytes out: <strong data-testid="proof-bytes">{audit ? bytes : '-'}</strong>
      </span>
      <span className="font-sans text-muted-foreground" data-testid="proof-status">
        {status}
      </span>
    </div>
  );
}
