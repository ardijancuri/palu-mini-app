# Image Copy + X/Twitter Share Methods

This document summarizes the methods used in the Waiting Room to:

- Generate a shareable image (canvas overlay with BNB price)
- Copy the image to the clipboard (desktop, iOS, Android where supported)
- Open the X/Twitter composer on desktop and iPhone

It includes practical constraints, code snippets, and recommended fallbacks so you can reuse the same behavior elsewhere.

## Prerequisites

- Serve over HTTPS (or `localhost`) for Clipboard and Web Share APIs
- Run clipboard and share actions within a direct user gesture (e.g., a button click)
- Modern browsers; iOS Safari 13.4+ recommended for image clipboard

## 1) Generate Image (Canvas)

1. Create a 1080x1080 canvas
2. Draw a background image
3. Overlay formatted price text with font + shadow
4. Export as a PNG Blob via `canvas.toBlob`

```js
async function createShareBlob(priceText) {
  const size = 1080;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = size; canvas.height = size;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const bg = new Image();
  bg.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    bg.onload = resolve;
    bg.onerror = () => reject(new Error('Failed to load background'));
    bg.src = '/assets/palu-price-1.png'; // or any asset path
  });

  ctx.drawImage(bg, 0, 0, size, size);
  ctx.fillStyle = '#F5C908';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.floor(size * 0.18)}px Oswald, sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.fillText(priceText, size / 2, size * 0.27);

  const blob = await new Promise(res => canvas.toBlob(res, 'image/png', 1.0));
  if (!blob) throw new Error('Failed to create image blob');
  return blob; // Blob{ type: 'image/png' }
}
```

## 2) Copy Image to Clipboard

Use the asynchronous Web Clipboard API with `ClipboardItem`. Always run from a user-initiated event in a secure context.

Key points:

- Try the blob's real type first; fall back to `'image/png'` and `'image/jpeg'`
- Optionally request `clipboard-write` permission (if available)
- Provide a clear UI notice on success/failure

```js
async function copyImageToClipboard(blob) {
  if (!navigator.clipboard || !window.ClipboardItem) return false;

  try {
    if (navigator.permissions?.query) {
      // Best-effort: log/prime permission state
      await navigator.permissions.query({ name: 'clipboard-write' });
    }

    const primaryType = blob.type || 'image/png';
    await navigator.clipboard.write([
      new ClipboardItem({ [primaryType]: blob })
    ]);
    return true;
  } catch (_) {
    // Fallbacks
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch (_) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/jpeg': blob })
        ]);
        return true;
      } catch {
        return false;
      }
    }
  }
}
```

Recommended UX:

- Success: “Image copied. Open X and paste it into your tweet.”
- Failure: “Could not copy automatically. When X opens, paste if available or attach the image.”

## 3) Open the X/Twitter Composer

### Desktop (and Android Web)

Open a new tab with the intent URL; clipboard paste works in the composer.

```js
function openTwitterIntent(text) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
```

### iPhone (iOS Safari)

Prefer deep-linking to the X app; URL schemes only prefill text — user must paste/attach the image.

```js
function openTwitterDeepLink(text) {
  const deep = `twitter://post?message=${encodeURIComponent(text)}`;
  window.location.href = deep; // Open X app composer
}
```

Note: iOS Web Share API can attach an image directly to the iOS share sheet (which can route to X), but if your design is “copy only, no download,” prefer clipboard-first + deep-link.

## 4) Putting It Together (Button Handler)

```js
async function handleShare(price) {
  // 1) Ensure image is ready
  const blob = await createShareBlob(`BNB $${price}`);

  // 2) Try to copy image
  const copied = await copyImageToClipboard(blob);
  alert(
    copied
      ? 'Image copied. Open X and paste it into your tweet.'
      : 'Could not copy automatically. When X opens, paste if available or attach the image.'
  );

  // 3) Open composer
  const text = `BNB $${price}!\n\n#BNB #Crypto #BNBPrice #Binance`;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
                (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document);
  if (isIOS) openTwitterDeepLink(text); else openTwitterIntent(text);
}
```

## Troubleshooting & Tips

- If copy fails without errors:
  - Check HTTPS (tunnels like `loca.lt`, `ngrok`, etc.)
  - Ensure the page is foregrounded and the action triggered by a user tap
  - Confirm iOS Safari version (13.4+ for image clipboard; better in later releases)
- If the X app doesn’t open on iOS:
  - The scheme may be blocked by the webview; try Safari proper or open the web intent instead
- Consider a small toast UI instead of `alert()` for a smoother UX

## Minimal API Surface (to reuse)

- `createShareBlob(priceText: string): Promise<Blob>`
- `copyImageToClipboard(blob: Blob): Promise<boolean>`
- `openTwitterIntent(text: string): void`
- `openTwitterDeepLink(text: string): void`

These four functions cover the core behaviors you can import into another project.

