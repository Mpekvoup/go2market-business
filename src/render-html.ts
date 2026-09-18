import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import type { ReactNode } from 'react';

// Wait for all lazy components before producing HTML for hydration.
export function renderHtml(element: ReactNode): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    let failed = false;
    const timer = setTimeout(() => {
      fail(new Error('Pre-render timed out'));
      rendering.abort();
    }, 30_000);
    const fail = (error: unknown) => {
      failed = true;
      clearTimeout(timer);
      output.destroy();
      reject(error);
    };
    output.on('data', chunk => chunks.push(Buffer.from(chunk)));
    output.on('error', fail);
    output.on('end', () => {
      clearTimeout(timer);
      if (!failed) resolve(Buffer.concat(chunks).toString('utf8'));
    });
    const rendering = renderToPipeableStream(element, {
      onAllReady() { if (!failed) rendering.pipe(output); },
      onShellError: fail,
      onError: fail,
    });
  });
}
