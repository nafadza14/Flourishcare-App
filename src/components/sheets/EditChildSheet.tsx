import React, { useEffect, useState } from 'react';
import { Baby, Calendar } from 'lucide-react';
import Sheet from '../ui/Sheet';
import Segmented from '../ui/Segmented';
import Switch from '../ui/Switch';
import { Field, TextArea } from '../ui/Field';
import { Button } from '../ui/primitives';
import { useToast } from '../ui/Toast';
import type { Child } from '../../types';
import { sendJSON } from '../../api';
import { emitDataChanged } from '../../lib/events';
import { todayISO } from '../../lib/format';

export default function EditChildSheet({ open, onClose, child }: { open: boolean; onClose: () => void; child: Child }) {
  const toast = useToast();
  const [name, setName] = useState(child.name);
  const [birthDate, setBirthDate] = useState(child.birthDate);
  const [gender, setGender] = useState<'L' | 'P'>(child.gender);
  const [premature, setPremature] = useState(child.isPremature);
  const [notes, setNotes] = useState(child.medicalNotes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(child.name);
      setBirthDate(child.birthDate);
      setGender(child.gender);
      setPremature(child.isPremature);
      setNotes(child.medicalNotes ?? '');
      setErrors({});
    }
  }, [open, child]);

  const save = async () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Isi nama panggilan si Kecil.';
    if (!birthDate || birthDate > todayISO()) e.birthDate = 'Tanggal lahir tidak boleh melewati hari ini.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const update = { name: name.trim(), birthDate, gender, isPremature: premature, medicalNotes: notes.trim() };
    try {
      if (child.id.startsWith('c_local_')) {
        const raw = JSON.parse(localStorage.getItem('fc_local_children') || '[]') as Child[];
        localStorage.setItem('fc_local_children', JSON.stringify(raw.map((c) => (c.id === child.id ? { ...c, ...update } : c))));
      } else {
        await sendJSON(`/api/children/${child.id}`, update, 'PUT');
      }
      emitDataChanged('children');
      toast({ title: 'Profil diperbarui', body: `Data ${update.name} sudah tersimpan.` });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Perbarui profil"
      footer={
        <Button block size="lg" loading={saving} onClick={save}>
          Simpan perubahan
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Field label="Nama panggilan" icon={Baby} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Field label="Tanggal lahir" type="date" icon={Calendar} max={todayISO()} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} error={errors.birthDate} />
        <div>
          <div className="text-[14px] text-mute mb-1.5 pl-1">Jenis kelamin</div>
          <Segmented
            value={gender}
            onChange={setGender}
            options={[
              { value: 'L', label: 'Laki-laki' },
              { value: 'P', label: 'Perempuan' },
            ]}
          />
        </div>
        <div className="flex items-center gap-3 bg-white rounded-[18px] border border-line p-4">
          <div className="flex-1">
            <div className="text-[16px]">Lahir prematur</div>
            <div className="text-[14px] text-mute">Lahir sebelum usia kehamilan 37 minggu</div>
          </div>
          <Switch checked={premature} onChange={setPremature} label="Lahir prematur" />
        </div>
        <TextArea label="Catatan kesehatan" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alergi, riwayat lahir, atau hal penting lain" />
        {errors.form && <p className="text-[14px] text-semantic-danger">{errors.form}</p>}
      </div>
    </Sheet>
  );
}
