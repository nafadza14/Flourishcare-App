import React, { useEffect, useState } from 'react';
import { Calendar, Ruler, Scale, CircleDashed, NotebookPen } from 'lucide-react';
import Sheet from '../ui/Sheet';
import { Field } from '../ui/Field';
import { Button } from '../ui/primitives';
import { useToast } from '../ui/Toast';
import type { Child, GrowthRecord } from '../../types';
import { sendJSON } from '../../api';
import { emitDataChanged } from '../../lib/events';
import { ageInMonths, todayISO } from '../../lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  child: Child;
  last?: GrowthRecord | null;
}

export default function AddMeasurementSheet({ open, onClose, child, last }: Props) {
  const toast = useToast();
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(todayISO());
      setWeight('');
      setHeight('');
      setHead('');
      setNotes('');
      setErrors({});
    }
  }, [open]);

  const parse = (v: string) => Number(v.replace(',', '.'));
  const lying = ageInMonths(child.birthDate, date ? new Date(date) : new Date()) < 24;
  const lengthWord = lying ? 'panjang badan' : 'tinggi badan';

  const validate = () => {
    const e: Record<string, string> = {};
    const w = parse(weight);
    const h = parse(height);
    const hc = parse(head);
    if (!date) e.date = 'Pilih tanggal pengukuran.';
    else if (date > todayISO()) e.date = 'Tanggal tidak boleh melewati hari ini.';
    else if (date < child.birthDate) e.date = 'Tanggal tidak boleh sebelum tanggal lahir.';
    if (!weight || !(w >= 0.5 && w <= 60)) e.weight = 'Isi berat antara 0,5 sampai 60 kg.';
    if (!height || !(h >= 30 && h <= 150)) e.height = `Isi ${lengthWord} antara 30 sampai 150 cm.`;
    if (head && !(hc >= 25 && hc <= 60)) e.head = 'Isi lingkar kepala antara 25 sampai 60 cm, atau kosongkan.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const jumpWarning = (() => {
    const w = parse(weight);
    if (!last || !w) return '';
    const change = Math.abs(w - last.weightKg) / last.weightKg;
    return change > 0.3 ? `Berat ini berbeda jauh dari catatan terakhir (${last.weightKg} kg). Pastikan tidak salah ketik ya.` : '';
  })();

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await sendJSON('/api/growth', {
        childId: child.id,
        date,
        weightKg: parse(weight),
        heightCm: parse(height),
        headCircumferenceCm: head ? parse(head) : null,
        notes: notes.trim(),
      });
      emitDataChanged('growth');
      toast({ title: 'Pengukuran tersimpan', body: `Grafik ${child.name} sudah diperbarui.` });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Gagal menyimpan. Coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Catat pengukuran"
      subtitle={`Masukkan hasil timbang dan ukur ${child.name}.`}
      footer={
        <Button block size="lg" onClick={save} loading={saving}>
          Simpan pengukuran
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Field label="Tanggal ukur" type="date" icon={Calendar} value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} error={errors.date} />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Berat"
            inputMode="decimal"
            placeholder="11,8"
            icon={Scale}
            suffix="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/[^0-9.,]/g, ''))}
            error={errors.weight}
          />
          <Field
            label={lying ? 'Panjang badan' : 'Tinggi badan'}
            inputMode="decimal"
            placeholder={lying ? '74' : '96'}
            icon={Ruler}
            suffix="cm"
            value={height}
            onChange={(e) => setHeight(e.target.value.replace(/[^0-9.,]/g, ''))}
            error={errors.height}
          />
        </div>
        <Field
          label={lying ? 'Lingkar kepala' : 'Lingkar kepala (opsional)'}
          inputMode="decimal"
          placeholder="48"
          icon={CircleDashed}
          suffix="cm"
          value={head}
          onChange={(e) => setHead(e.target.value.replace(/[^0-9.,]/g, ''))}
          error={errors.head}
        />
        <Field label="Catatan (opsional)" placeholder="Misalnya sedang tumbuh gigi" icon={NotebookPen} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <p className="text-[13px] text-mute leading-relaxed -mt-1">
          {lying
            ? 'Di bawah 2 tahun, ukur panjang badan sambil berbaring. Lingkar kepala diukur melingkari dahi dan bagian belakang kepala yang paling menonjol.'
            : 'Di atas 2 tahun, ukur tinggi badan sambil berdiri tanpa alas kaki.'}
        </p>
        {jumpWarning && <p className="text-[14px] text-[#9A6A12] bg-semantic-warning-soft rounded-[16px] px-4 py-3">{jumpWarning}</p>}
        {errors.form && <p className="text-[14px] text-semantic-danger">{errors.form}</p>}
      </div>
    </Sheet>
  );
}
