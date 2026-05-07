import { useState } from 'react';

/**
 * Copy text to clipboard
 * @returns [copiedText, copy function]
 */
export function useCopyToClipboard(): [
  string | null,
  (text: string) => Promise<void>
] {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = async (text: string) => {
    // 🔒 SSR Guard: Only run on client side
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      console.warn('Clipboard not supported or server environment');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      // Reset after 2 seconds
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      setCopiedText(null);
    }
  };

  return [copiedText, copy];
}
