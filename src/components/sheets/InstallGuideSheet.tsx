import React, { useState } from 'react';
import { Check, Copy, Ellipsis, EllipsisVertical, Menu, MonitorDown, Share, SquarePlus, type LucideIcon } from 'lucide-react';
import Sheet from '../ui/Sheet';
import { Button } from '../ui/primitives';
import { useToast } from '../ui/Toast';
import { APP_URL, useInstall, type GuideMode } from '../../lib/install';
import { APP_ICON_SRC } from '../FlourishCareLogo';

/** A browser button, drawn inline in the instructions so parents know what to look for */
function Key({ icon: Icon, label }: { icon: LucideIcon; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle mx-0.5 px-1.5 py-[1px] rounded-[8px] bg-fill text-ink text-[14px] leading-6 whitespace-nowrap">
      <Icon className="w-[15px] h-[15px] text-[#0A84FF]" strokeWidth={2} aria-hidden />
      {label && <span>{label}</span>}
    </span>
  );
}

function Steps({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="mt-5 space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3.5">
          <span className="w-7 h-7 rounded-full bg-orange-gradient text-white text-[14px] font-medium flex items-center justify-center shrink-0 mt-[1px]">{i + 1}</span>
          <p className="text-[16px] leading-[1.6] text-ink-2 min-w-0">{step}</p>
        </li>
      ))}
    </ol>
  );
}

const BENEFITS = ['Sekali ketuk dari layar utama', 'Tampil penuh tanpa bilah browser', 'Tetap masuk, data si Kecil aman'];

/** Home screen preview with the official app icon */
function Preview() {
  return (
    <div className="mt-1 rounded-[22px] bg-brand-orange-soft/60 border border-line p-4 flex items-center gap-4">
      <div className="flex flex-col items-center shrink-0 w-[76px]">
        <img src={APP_ICON_SRC} alt="" className="w-[60px] h-[60px] rounded-[15px] shadow-[0_4px_12px_rgba(35,27,22,0.16)]" />
        <span className="text-[12px] text-ink mt-1.5 truncate max-w-full">FlourishCare</span>
      </div>
      <ul className="space-y-1.5 min-w-0">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[14px] text-ink-2 leading-snug">
            <Check className="w-4 h-4 text-semantic-success shrink-0 mt-[2px]" strokeWidth={2.4} aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function copyLink(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(APP_URL);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = APP_URL;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Defaults to the right guide for this device */
  mode?: GuideMode;
}

export default function InstallGuideSheet({ open, onClose, mode: forcedMode }: Props) {
  const { device, guideMode, canPrompt, promptInstall } = useInstall();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const mode = forcedMode ?? guideMode;
  const deviceName = device.ipad ? 'iPad' : device.ios ? 'iPhone' : 'HP';

  let title = '';
  let subtitle = '';
  let body: React.ReactNode = null;
  let footer: React.ReactNode = (
    <Button block size="lg" onClick={onClose}>
      Mengerti
    </Button>
  );

  if (mode === 'ios') {
    title = `Pasang di ${deviceName}`;
    subtitle = 'Cukup 3 langkah, tidak perlu App Store.';
    const firstStep =
      device.iosBrowser === 'safari' ? (
        <>
          Ketuk <Key icon={Share} label="Bagikan" /> di bilah Safari. Kalau tidak terlihat, ketuk <Key icon={Ellipsis} /> dulu.
        </>
      ) : device.iosBrowser === 'chrome' ? (
        <>
          Ketuk <Key icon={Share} label="Bagikan" /> di kanan bilah alamat Chrome.
        </>
      ) : (
        <>
          Buka menu browser, lalu ketuk <Key icon={Share} label="Bagikan" />.
        </>
      );
    body = (
      <>
        <Preview />
        <Steps
          steps={[
            firstStep,
            <>
              Gulir ke bawah, lalu pilih <Key icon={SquarePlus} label="Tambah ke Layar Utama" />.
            </>,
            <>
              Ketuk <b className="font-medium text-ink">Tambah</b> di pojok kanan atas. Ikon FlourishCare langsung muncul di layar utama.
            </>,
          ]}
        />
      </>
    );
  } else if (mode === 'android-manual') {
    title = 'Pasang di HP';
    subtitle = 'Cukup 3 langkah, tidak perlu Play Store.';
    body = (
      <>
        <Preview />
        <Steps
          steps={[
            <>
              Ketuk menu browser <Key icon={EllipsisVertical} /> atau <Key icon={Menu} /> di pojok layar.
            </>,
            <>
              Pilih <b className="font-medium text-ink">Instal aplikasi</b> atau <b className="font-medium text-ink">Tambahkan ke layar utama</b>.
            </>,
            <>
              Ketuk <b className="font-medium text-ink">Instal</b> atau <b className="font-medium text-ink">Tambahkan</b>. Ikon FlourishCare muncul di layar utama.
            </>,
          ]}
        />
      </>
    );
  } else if (mode === 'in-app') {
    const browser = device.ios ? 'Safari' : 'Chrome';
    title = `Buka di ${browser} dulu`;
    subtitle = `FlourishCare sedang dibuka dari dalam ${device.inAppName ?? 'aplikasi lain'}. Pemasangan ke layar utama hanya bisa lewat ${browser}.`;
    body = (
      <Steps
        steps={[
          <>
            Ketuk <Key icon={Ellipsis} /> atau <Key icon={EllipsisVertical} /> di pojok kanan atas.
          </>,
          <>
            Pilih <b className="font-medium text-ink">Buka di browser</b> atau <b className="font-medium text-ink">Buka di {browser}</b>. Bisa juga salin tautan di bawah lalu tempel di {browser}.
          </>,
          <>
            Setelah terbuka di {browser}, ketuk <b className="font-medium text-ink">Pasang</b> pada kartu FlourishCare.
          </>,
        ]}
      />
    );
    footer = (
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          icon={copied ? Check : Copy}
          onClick={async () => {
            const ok = await copyLink();
            setCopied(ok);
            toast(ok ? { title: 'Tautan disalin', body: `Tempel di ${browser} untuk membuka FlourishCare.` } : { title: 'Belum bisa menyalin', body: APP_URL, tone: 'warning' });
          }}
        >
          {copied ? 'Tersalin' : 'Salin tautan'}
        </Button>
        <Button size="lg" className="flex-1" onClick={onClose}>
          Mengerti
        </Button>
      </div>
    );
  } else {
    title = 'Pakai di HP';
    subtitle = 'Scan dengan kamera HP, lalu pasang di layar utama.';
    body = (
      <div className="pt-2 pb-1 flex flex-col items-center text-center">
        <div className="w-[208px] h-[208px] rounded-[24px] bg-white border border-line shadow-card p-3.5">
          <img src="/brand/qr-app.svg" alt="Kode QR untuk membuka app.flourishcare.id" className="w-full h-full" />
        </div>
        <div className="text-[15px] text-mute mt-3">app.flourishcare.id</div>
        {canPrompt && (
          <Button
            variant="secondary"
            className="mt-5"
            icon={MonitorDown}
            onClick={async () => {
              const outcome = await promptInstall();
              if (outcome === 'accepted') onClose();
            }}
          >
            Pasang juga di komputer ini
          </Button>
        )}
      </div>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title={title} subtitle={subtitle} footer={footer}>
      {body}
    </Sheet>
  );
}
