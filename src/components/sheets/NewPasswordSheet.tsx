import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import Sheet from '../ui/Sheet';
import { Field } from '../ui/Field';
import { Button } from '../ui/primitives';
import { useToast } from '../ui/Toast';
import { updatePassword } from '../../lib/supabase';

/** Shown after opening a password reset link from email. */
export default function NewPasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const e: Record<string, string> = {};
    if (password.length < 8) e.password = 'Kata sandi minimal 8 karakter.';
    else if (password !== confirm) e.confirm = 'Kata sandi belum sama.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await updatePassword(password);
      toast({ title: 'Kata sandi diperbarui', body: 'Gunakan kata sandi baru saat masuk berikutnya.' });
      setPassword('');
      setConfirm('');
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (
    <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} className="text-mute">
      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Buat kata sandi baru"
      subtitle="Ayah Bunda masuk lewat tautan dari email. Buat kata sandi baru untuk akun ini."
      footer={
        <Button block size="lg" loading={saving} onClick={save}>
          Simpan kata sandi
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Field
          label="Kata sandi baru"
          icon={Lock}
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          trailing={toggle}
        />
        <Field
          label="Ulangi kata sandi"
          icon={Lock}
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        {errors.form && <p className="text-[15px] text-semantic-danger bg-semantic-danger-soft rounded-[16px] px-4 py-3">{errors.form}</p>}
      </div>
    </Sheet>
  );
}
