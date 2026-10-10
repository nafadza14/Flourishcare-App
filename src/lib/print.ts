/**
 * Print or save as PDF through a clean, standalone document,
 * so the output never includes the phone frame or app chrome.
 */
export function printDocument(title: string, bodyHtml: string) {
  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  @page { margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: "Outfit", -apple-system, "Segoe UI", Roboto, sans-serif; color: #231B16; margin: 0; font-size: 12.5px; line-height: 1.55; }
  .head { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #F29935; padding-bottom: 12px; margin-bottom: 18px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .dot { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(150deg,#F6AA55,#E5801F); }
  h1 { font-size: 20px; font-weight: 500; margin: 0; }
  h2 { font-size: 15px; font-weight: 500; margin: 22px 0 8px; }
  .muted { color: #8E837B; }
  .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #FFF7EE; border-radius: 12px; padding: 12px; }
  .meta b { display: block; font-weight: 500; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #F0E7DE; vertical-align: top; }
  th { font-weight: 500; color: #8E837B; font-size: 11.5px; text-transform: uppercase; letter-spacing: .04em; }
  .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
  .ok { background: #E9F5EC; color: #2F7A49; }
  .warn { background: #FFF5DD; color: #8A5E0C; }
  .bad { background: #FDECE7; color: #B44A33; }
  .result { border-radius: 14px; padding: 14px; margin-top: 8px; }
  .note { margin-top: 26px; font-size: 11px; color: #8E837B; border-top: 1px solid #F0E7DE; padding-top: 10px; }
  .sign { margin-top: 30px; text-align: right; }
  .cta { display: flex; align-items: center; gap: 16px; margin-top: 24px; padding: 14px 16px; border-radius: 14px; border: 1.5px solid #F29935; background: #FFF7EE; break-inside: avoid; }
  .cta img { width: 92px; height: 92px; flex-shrink: 0; }
  .cta b { font-size: 14px; font-weight: 500; }
  .cta .url { color: #C9671A; font-weight: 500; }
  @media (max-width: 640px) { .meta { grid-template-columns: repeat(2, 1fr); } }
</style>
</head>
<body>
${bodyHtml}
<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 250); });</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  }
  // Popup blocked: fall back to a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) return false;
  doc.open();
  doc.write(html.replace(/<script>[\s\S]*<\/script>/, ''));
  doc.close();
  window.setTimeout(() => {
    iframe.contentWindow?.print();
    window.setTimeout(() => iframe.remove(), 1500);
  }, 300);
  return true;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function printHeader(subtitle: string, code?: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `<div class="head"><div class="brand"><img src="${origin}/brand/logo.png" alt="FlourishCare" style="height:56px;width:auto" /><div><div class="muted">${escapeHtml(subtitle)}</div></div></div>${
    code ? `<div class="muted" style="text-align:right">Kode<br/><b style="color:#231B16">${escapeHtml(code)}</b></div>` : ''
  }</div>`;
}

/** Booking call to action with a QR code to book.flourishcare.id */
export function printCta(title: string, body: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `<div class="cta"><img src="${origin}/brand/qr-book.svg" alt="QR booking FlourishCare" /><div><b>${escapeHtml(title)}</b><div style="margin-top:4px">${escapeHtml(
    body,
  )}</div><div style="margin-top:6px">Pindai QR atau buka <span class="url">book.flourishcare.id</span></div></div></div>`;
}

/** Downscale a picked image to a small JPEG data URL (keeps uploads light). */
export function imageToDataUrl(file: File, maxSize = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca foto.'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(String(reader.result));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Format foto tidak didukung.'));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
