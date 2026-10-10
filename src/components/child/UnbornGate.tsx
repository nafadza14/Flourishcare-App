import React from 'react';
import { Baby } from 'lucide-react';
import { EmptyState, Button } from '../ui/primitives';
import { useNav } from '../../lib/nav';

/** Shown on child-only screens while the active profile is still a pregnancy */
export default function UnbornGate({ name }: { name: string }) {
  const nav = useNav();
  return (
    <EmptyState
      icon={Baby}
      title="Aktif setelah si Kecil lahir"
      body={`Fitur ini menyesuaikan usia ${name}. Sementara itu, pantau kehamilan Bunda di menu Pantau.`}
      action={
        <Button variant="soft" onClick={() => { nav.popToRoot(); nav.setTab('track'); }}>
          Buka pantauan kehamilan
        </Button>
      }
    />
  );
}
