import React, { useEffect, useRef, useState } from 'react';
import { Baby, Calendar, Camera, Loader2, Trash2 } from 'lucide-react';
import Sheet from '../ui/Sheet';
import Segmented from '../ui/Segmented';
import Switch from '../ui/Switch';
import { Field, TextArea } from '../ui/Field';
import { Button } from '../ui/primitives';
import { useToast } from '../ui/Toast';
import ChildAvatar from '../child/ChildAvatar';
import type { Child } from '../../types';
import { sendJSON } from '../../api';
import { emitDataChanged } from '../../lib/events';
import { todayISO } from '../../lib/format';
import { compressImage, uploadPrepared } from '../../lib/media';
import { hphtFromHpl, hplFromHpht } from '../../lib/pregnancy';
import { useStore } from '../../lib/store';

const BLOOD_TYPES = ['', 'A', 'B', 'AB', 'O'];

export default function EditChildSheet({ open, onClose, child }: { open: boolean; onClose: () => void; child: Child }) {
  const toast = useToast();
  const { refreshChildren } = useStore();
  const [name, setName] = useState(child.name);
  const [birthDate, setBirthDate] = useState(child.birthDate);
  const [gender, setGender] = useState<'L' | 'P'>(child.gender);
  const [premature, setPremature] = useState(child.isPremature);
  const [weeks, setWeeks] = useState(child.gestationalWeeks ? String(child.gestationalWeeks) : '');
  const [allergies, setAllergies] = useState(child.allergies ?? '');
  const [bloodType, setBloodType] = useState(child.bloodType ?? '');
  const [notes, setNotes] = useState(child.medicalNotes ?? '');
  const [hpl, setHpl] = useState(child.expectedDueDate || child.birthDate);
  const [hpht, setHpht] = useState(child.lmpDate || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(child.name);
      setBirthDate(child.birthDate);
      setGender(child.gender);
      setPremature(child.isPremature);
      setWeeks(child.gestationalWeeks ? String(child.gestationalWeeks) : '');
      setAllergies(child.allergies ?? '');
      setBloodType(child.bloodType ?? '');
      setNotes(child.medicalNotes ?? '');
      setHpl(child.expectedDueDate || child.birthDate);
      setHpht(child.lmpDate || '');
      setErrors({});
    }
  }, [open, child]);

  const changePhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoBusy(true);
    try {
      const prepared = await compressImage(file, 720, 0.85);
      const media = await uploadPrepared(child.id, prepared, 'avatar');
      await sendJSON(`/api/children/${child.id}`, { photoPath: media.path }, 'PUT');
      await refreshChildren(child.id);
      toast({ title: 'Foto profil diperbarui' });
    } catch (err: any) {
      toast({ title: 'Foto belum tersimpan', body: err?.message || 'Coba lagi.', tone: 'warning' });
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    try {
      await sendJSON(`/api/children/${child.id}`, { photoPath: null }, 'PUT');
      await refreshChildren(child.id);
    } catch (err: any) {
      toast({ title: 'Belum tersimpan', body: err?.message, tone: 'warning' });
    } finally {
      setPhotoBusy(false);
    }
  };

  const save = async () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Isi nama panggilan.';
    if (child.isUnborn) {
      if (!hpl) e.hpl = 'Isi HPL.';
    } else {
      if (!birthDate || birthDate > todayISO()) e.birthDate = 'Tanggal lahir tidak boleh melewati hari ini.';
      if (premature && weeks && !(Number(weeks) >= 22 && Number(weeks) < 37)) e.weeks = 'Usia kehamilan prematur antara 22 sampai 36 minggu.';
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const update = child.isUnborn
      ? { name: name.trim(), expectedDueDate: hpl, lmpDate: hpht || null }
      : {
          name: name.trim(),
          birthDate,
          gender,
          isPremature: premature,
          gestationalWeeks: premature && weeks ? Number(weeks) : null,
          allergies: allergies.trim(),
          bloodType,
          medicalNotes: notes.trim(),
        };
    try {
      await sendJSON(`/api/children/${child.id}`, update, 'PUT');
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
      title={child.isUnborn ? 'Perbarui profil kehamilan' : 'Perbarui profil'}
      footer={
        <Button block size="lg" loading={saving} onClick={save}>
          Simpan perubahan
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        {!child.isUnborn && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <ChildAvatar child={child} size={76} />
              {photoBusy && (
                <span className="absolute inset-0 rounded-full bg-black/35 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="soft" icon={Camera} disabled={photoBusy} onClick={() => fileRef.current?.click()}>
                {child.photoUrl ? 'Ganti foto' : 'Tambah foto'}
              </Button>
              {child.photoUrl && (
                <Button size="sm" variant="ghost" icon={Trash2} disabled={photoBusy} onClick={removePhoto}>
                  Hapus foto
                </Button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(ev) => {
                changePhoto(ev.target.files?.[0]);
                ev.target.value = '';
              }}
            />
          </div>
        )}
        <Field label="Nama panggilan" icon={Baby} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />

        {child.isUnborn ? (
          <>
            <Field
              label="Hari perkiraan lahir (HPL)"
              type="date"
              icon={Calendar}
              value={hpl}
              onChange={(e) => {
                setHpl(e.target.value);
                if (e.target.value) setHpht(hphtFromHpl(e.target.value));
              }}
              error={errors.hpl}
            />
            <Field
              label="HPHT (opsional)"
              type="date"
              icon={Calendar}
              max={todayISO()}
              value={hpht}
              onChange={(e) => {
                setHpht(e.target.value);
                if (e.target.value) setHpl(hplFromHpht(e.target.value));
              }}
              hint="Mengubah salah satu otomatis menghitung yang lain. Ikuti HPL dari dokter bila berbeda."
            />
          </>
        ) : (
          <>
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
            <div className="bg-white rounded-[18px] border border-line p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[16px]">Lahir prematur</div>
                  <div className="text-[14px] text-mute">Lahir sebelum usia kehamilan 37 minggu</div>
                </div>
                <Switch checked={premature} onChange={setPremature} label="Lahir prematur" />
              </div>
              {premature && (
                <Field
                  className="mt-3"
                  label="Usia kehamilan saat lahir"
                  inputMode="numeric"
                  suffix="minggu"
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value.replace(/[^0-9]/g, ''))}
                  error={errors.weeks}
                  hint="Untuk usia koreksi di grafik dan milestone sampai usia 2 tahun."
                />
              )}
            </div>
            <Field label="Alergi" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Contoh: susu sapi, telur, kacang" />
            <div>
              <div className="text-[14px] text-mute mb-1.5 pl-1">Golongan darah</div>
              <Segmented
                size="sm"
                value={bloodType || 'none'}
                onChange={(v) => setBloodType(v === 'none' ? '' : v)}
                options={BLOOD_TYPES.map((b) => ({ value: b || 'none', label: b || 'Belum tahu' }))}
              />
            </div>
            <TextArea label="Riwayat dan catatan kesehatan" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Riwayat lahir, rawat inap, obat rutin, atau hal penting lain" />
          </>
        )}
        {errors.form && <p className="text-[14px] text-semantic-danger">{errors.form}</p>}
      </div>
    </Sheet>
  );
}
