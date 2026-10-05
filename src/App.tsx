import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Battery,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  CreditCard,
  Disc,
  Droplet,
  Edit2,
  Edit3,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';
import {
  Language,
  MaintenanceType,
  SiyantekProvider,
  Vehicle,
  formatLocalizedNumber,
  useSiyantek,
} from './context/SiyantekContext';
import { useColors } from './constants/colors';

const TYPES: { key: MaintenanceType; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { key: 'oil', icon: Droplet },
  { key: 'brakes', icon: Disc },
  { key: 'tires', icon: Circle },
  { key: 'inspection', icon: ClipboardList },
  { key: 'battery', icon: Battery },
  { key: 'other', icon: Wrench },
];

const dateLabel = (value: string, language: Language) => {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(
    language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  ).format(date);
};

const daysSince = (value: string) =>
  Math.max(0, Math.round((Date.now() - new Date(`${value}T12:00:00`).getTime()) / 86400000));

function LogoMark() {
  return (
    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px] bg-[#16A6A0]">
      <Activity size={20} color="#ffffff" strokeWidth={2.5} />
    </div>
  );
}

function LanguagePicker() {
  const { language, setLanguage, isRTL } = useSiyantek();
  const languages: { key: Language; label: string }[] = [
    { key: 'en', label: 'EN' },
    { key: 'fr', label: 'FR' },
    { key: 'ar', label: 'ع' },
  ];
  return (
    <div
      className={`flex items-center rounded-[18px] border border-[#DCE7E3] bg-white p-[3px] ${
        isRTL ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {languages.map((item) => {
        const selected = item.key === language;
        return (
          <button
            key={item.key}
            type="button"
            data-testid={`language-${item.key}`}
            onClick={() => setLanguage(item.key)}
            className={`flex h-[28px] min-w-[31px] items-center justify-center rounded-[14px] px-[7px] text-[10px] font-bold transition-colors ${
              selected ? 'bg-[#102A35] text-white' : 'text-[#668087]'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <div className="flex min-w-[172px] flex-1 items-center gap-[9px] rounded-[17px] border border-[#DCE7E3] bg-white p-[12px]">
      <div className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-[10px] bg-[#DDF4EF]">
        <Icon size={15} color={colors.teal} />
      </div>
      <div className="flex-1">
        <div className="mb-[2px] text-[9px] font-semibold text-[#668087]">{label}</div>
        <div className="text-[12px] font-bold text-[#102A35]">{value}</div>
      </div>
    </div>
  );
}

function TypeIcon({ type }: { type: MaintenanceType }) {
  const colors = useColors();
  const item = TYPES.find((entry) => entry.key === type) ?? TYPES[5];
  const Icon = item.icon;
  const isOil = type === 'oil';
  return (
    <div
      className={`flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[12px] ${
        isOil ? 'bg-[#FFF1D8]' : 'bg-[#DDF4EF]'
      }`}
    >
      <Icon size={17} color={isOil ? colors.accentForeground : colors.teal} />
    </div>
  );
}

function AddMaintenanceModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  const { addRecord, t, vehicle, isRTL } = useSiyantek();
  const [type, setType] = useState<MaintenanceType>('oil');
  const [mileage, setMileage] = useState(String(vehicle.mileage));
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [nextMileage, setNextMileage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setMileage(vehicle.mileage > 0 ? String(vehicle.mileage) : '');
    }
  }, [visible, vehicle.mileage]);

  if (!visible) return null;

  const closeAndReset = () => {
    setType('oil');
    setMileage(String(vehicle.mileage));
    setCost('');
    setNotes('');
    setNextMileage('');
    setError('');
    onClose();
  };

  const save = () => {
    const parsedMileage = Number(mileage.replace(/[^\d.]/g, ''));
    if (!mileage.trim()) {
      setError(t('requiredMileage'));
      return;
    }
    if (!Number.isFinite(parsedMileage) || parsedMileage <= 0) {
      setError(t('invalidMileage'));
      return;
    }
    const parsedNextMileage = nextMileage.trim()
      ? Number(nextMileage.replace(/[^\d.]/g, ''))
      : undefined;
    if (
      parsedNextMileage !== undefined &&
      (!Number.isFinite(parsedNextMileage) || parsedNextMileage <= parsedMileage)
    ) {
      setError(t('invalidNextMileage'));
      return;
    }
    addRecord({
      type,
      mileage: parsedMileage,
      date: new Date().toISOString().slice(0, 10),
      cost: Number(cost.replace(/[^\d.]/g, '')) || 0,
      notes: notes.trim(),
      nextMileage: parsedNextMileage,
    });
    closeAndReset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="flex max-h-[92vh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[24px] bg-[#F4F7F5] shadow-xl sm:rounded-[24px]"
      >
        <div className="flex items-center justify-between border-b border-[#DCE7E3] px-[20px] py-[17px]">
          <div>
            <div className="text-[10px] font-bold tracking-[1.1px] text-[#16A6A0] uppercase">
              {t('service')}
            </div>
            <div className="mt-[3px] text-[23px] font-bold text-[#102A35]">
              {t('addServiceTitle')}
            </div>
          </div>
          <button
            type="button"
            data-testid="close-maintenance"
            onClick={closeAndReset}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-[14px] bg-[#E7EFEC]"
          >
            <X size={19} color={colors.foreground} />
          </button>
        </div>

        <div className="overflow-y-auto p-[20px] pb-[32px]">
          <div className="mt-[4px] mb-[8px] text-[12px] font-bold text-[#102A35]">
            {t('serviceType')}
          </div>
          <div className="grid grid-cols-3 gap-[8px]">
            {TYPES.map((item) => {
              const selected = item.key === type;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  data-testid={`maintenance-type-${item.key}`}
                  onClick={() => setType(item.key)}
                  className={`flex min-h-[66px] flex-col items-center justify-center gap-[6px] rounded-[13px] border px-[8px] transition-colors ${
                    selected
                      ? 'border-[#16A6A0] bg-[#DDF4EF] text-[#16A6A0]'
                      : 'border-[#DCE7E3] bg-white text-[#102A35]'
                  }`}
                >
                  <Icon size={18} color={selected ? colors.teal : colors.mutedForeground} />
                  <span className="text-center text-[10px] font-bold">{t(item.key)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-[16px] mb-[8px] text-[12px] font-bold text-[#102A35]">
            {t('mileage')}
          </div>
          <input
            data-testid="maintenance-mileage"
            type="text"
            inputMode="numeric"
            value={mileage}
            onChange={(e) => {
              setMileage(e.target.value);
              setError('');
            }}
            placeholder={t('enterMileage')}
            className={`min-h-[50px] w-full rounded-[13px] border bg-white px-[14px] text-[14px] text-[#102A35] placeholder-[#668087] outline-none ${
              error ? 'border-[#C94E4E]' : 'border-[#D2E1DC]'
            }`}
          />
          {error ? (
            <div className="mt-[6px] text-[11px] font-semibold text-[#C94E4E]">{error}</div>
          ) : null}

          <div className=" flex gap-[10px]">
            <div className="flex-1">
              <div className="mt-[16px] mb-[8px] text-[12px] font-bold text-[#102A35]">
                {t('cost')}
              </div>
              <input
                data-testid="maintenance-cost"
                type="text"
                inputMode="numeric"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder={t('enterCost')}
                className="min-h-[50px] w-full rounded-[13px] border border-[#D2E1DC] bg-white px-[14px] text-[14px] text-[#102A35] placeholder-[#668087] outline-none"
              />
            </div>
            <div className="flex-1">
              <div className="mt-[16px] mb-[8px] text-[12px] font-bold text-[#102A35]">
                {t('nextMileage')}
              </div>
              <input
                data-testid="maintenance-next-mileage"
                type="text"
                inputMode="numeric"
                value={nextMileage}
                onChange={(e) => setNextMileage(e.target.value)}
                placeholder={t('enterNextMileage')}
                className="min-h-[50px] w-full rounded-[13px] border border-[#D2E1DC] bg-white px-[14px] text-[14px] text-[#102A35] placeholder-[#668087] outline-none"
              />
            </div>
          </div>

          <div className="mt-[16px] mb-[8px] text-[12px] font-bold text-[#102A35]">
            {t('notes')}
          </div>
          <textarea
            data-testid="maintenance-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder={t('addNotes')}
            className="min-h-[92px] w-full rounded-[13px] border border-[#D2E1DC] bg-white px-[14px] pt-[14px] text-[14px] text-[#102A35] placeholder-[#668087] outline-none"
          />

          <button
            type="button"
            data-testid="save-maintenance"
            onClick={save}
            className="mt-[25px] flex min-h-[52px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-[#16A6A0] px-[18px] text-[14px] font-bold text-white transition-opacity active:opacity-85"
          >
            <Check size={18} color="#ffffff" />
            <span>{t('saveMaintenance')}</span>
          </button>
          <button
            type="button"
            onClick={closeAndReset}
            className="flex w-full items-center justify-center py-[16px] text-[13px] font-bold text-[#668087]"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

function VehicleModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: (mileage: number) => void;
}) {
  const colors = useColors();
  const { vehicle, updateVehicle, t, isRTL } = useSiyantek();
  const [form, setForm] = useState<Vehicle>(vehicle);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setForm(vehicle);
      setError('');
    }
  }, [visible, vehicle]);

  if (!visible) return null;

  const update = (key: keyof Vehicle, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="flex max-h-[92vh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[24px] bg-[#F4F7F5] shadow-xl sm:rounded-[24px]"
      >
        <div className="flex items-center justify-between border-b border-[#DCE7E3] px-[20px] py-[17px]">
          <div>
            <div className="text-[10px] font-bold tracking-[1.1px] text-[#16A6A0] uppercase">
              {t('yourCar')}
            </div>
            <div className="mt-[3px] text-[23px] font-bold text-[#102A35]">
              {t('vehicleDetails')}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-[14px] bg-[#E7EFEC]"
          >
            <X size={19} color={colors.foreground} />
          </button>
        </div>

        <div className="overflow-y-auto p-[20px]">
          {(['brand', 'model', 'year', 'plate'] as const).map((key) => (
            <div key={key}>
              <div className="mt-[16px] mb-[8px] text-[12px] font-bold text-[#102A35]">
                {t(key)}
              </div>
              <input
                type="text"
                value={String(form[key])}
                onChange={(e) => update(key, e.target.value)}
                placeholder={t(key)}
                className="min-h-[50px] w-full rounded-[13px] border border-[#D2E1DC] bg-white px-[14px] text-[14px] text-[#102A35] placeholder-[#668087] outline-none"
              />
            </div>
          ))}
          <div className="mt-[16px] mb-[8px] text-[12px] font-bold text-[#102A35]">
            {t('currentMileage')}
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={String(form.mileage)}
            onChange={(e) =>
              update('mileage', Number(e.target.value.replace(/[^\d.]/g, '')) || 0)
            }
            className="min-h-[50px] w-full rounded-[13px] border border-[#D2E1DC] bg-white px-[14px] text-[14px] text-[#102A35] placeholder-[#668087] outline-none"
          />
          {error ? (
            <div className="mt-[8px] text-[11px] font-semibold text-[#C94E4E]">{error}</div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (!form.brand.trim() || !form.model.trim()) {
                setError(t('requiredVehicle'));
                return;
              }
              if (form.mileage < 0) {
                setError(t('invalidMileage'));
                return;
              }
              updateVehicle({
                ...form,
                brand: form.brand.trim(),
                model: form.model.trim(),
                year: form.year.trim(),
                plate: form.plate.trim(),
              });
              onSaved(form.mileage);
              onClose();
            }}
            className="mt-[25px] flex min-h-[52px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-[#16A6A0] px-[18px] text-[14px] font-bold text-white transition-opacity active:opacity-85"
          >
            <Save size={18} color="#ffffff" />
            <span>{t('saveChanges')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  const { language, setLanguage, t, isRTL, resetAllData } = useSiyantek();
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const version = '1.0.0';

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="flex max-h-[92vh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[24px] bg-[#F4F7F5] shadow-xl sm:rounded-[24px]"
        >
          <div className="flex items-center justify-between border-b border-[#DCE7E3] px-[20px] py-[17px]">
            <div>
              <div className="text-[10px] font-bold tracking-[1.1px] text-[#16A6A0] uppercase">
                {t('appName')}
              </div>
              <div className="mt-[3px] text-[23px] font-bold text-[#102A35]">
                {t('settings')}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('close')}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-[14px] bg-[#E7EFEC]"
            >
              <X size={19} color={colors.foreground} />
            </button>
          </div>

          <div className="overflow-y-auto p-[20px]">
            <div className="mt-[4px] mb-[8px] text-[12px] font-bold text-[#102A35]">
              {t('language')}
            </div>
            <div className="mb-[16px] flex gap-[8px]">
              {(['fr', 'en', 'ar'] as Language[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={`flex min-h-[46px] flex-1 items-center justify-center rounded-[13px] border px-[6px] text-[11px] font-bold transition-colors ${
                    language === item
                      ? 'border-[#16A6A0] bg-[#DDF4EF] text-[#16A6A0]'
                      : 'border-[#DCE7E3] bg-white text-[#102A35]'
                  }`}
                >
                  {item === 'ar' ? 'العربية' : item === 'fr' ? 'Français' : 'English'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPrivacyVisible(true)}
              className="mt-[10px] flex w-full items-center gap-[11px] rounded-[16px] border border-[#DCE7E3] bg-white p-[13px] text-start"
            >
              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#DDF4EF]">
                <Shield size={17} color={colors.teal} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-[#102A35]">{t('privacy')}</div>
                <div className="mt-[3px] text-[9px] leading-[14px] text-[#668087]">
                  {t('privacyBody')}
                </div>
              </div>
              {isRTL ? (
                <ChevronLeft size={18} color={colors.mutedForeground} />
              ) : (
                <ChevronRight size={18} color={colors.mutedForeground} />
              )}
            </button>

            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="mt-[10px] flex w-full items-center gap-[11px] rounded-[16px] border border-[#DCE7E3] bg-white p-[13px] text-start"
              >
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#C94E4E]/10">
                  <Trash2 size={17} color={colors.destructive} />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-[#C94E4E]">{t('clearData')}</div>
                </div>
              </button>
            ) : (
              <div className="mt-[10px] rounded-[16px] border border-[#C94E4E]/30 bg-white p-[14px]">
                <div className="text-[12px] font-semibold text-[#102A35]">
                  {t('clearDataConfirm')}
                </div>
                <div className="mt-[12px] flex gap-[8px]">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 rounded-[11px] border border-[#DCE7E3] py-[9px] text-[12px] font-bold text-[#668087]"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await resetAllData();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="flex-1 rounded-[11px] bg-[#C94E4E] py-[9px] text-[12px] font-bold text-white"
                  >
                    {t('clearData')}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-[22px] text-center text-[10px] font-semibold text-[#668087]">
              {t('appVersion')} {version}
            </div>
          </div>
        </div>
      </div>

      {privacyVisible ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="flex max-h-[92vh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[24px] bg-[#F4F7F5] shadow-xl sm:rounded-[24px]"
          >
            <div className="flex items-center justify-between border-b border-[#DCE7E3] px-[20px] py-[17px]">
              <div className="text-[23px] font-bold text-[#102A35]">{t('privacyTitle')}</div>
              <button
                type="button"
                onClick={() => setPrivacyVisible(false)}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[14px] bg-[#E7EFEC]"
              >
                <X size={19} color={colors.foreground} />
              </button>
            </div>
            <div className="p-[20px]">
              <p className="mb-[18px] text-[13px] leading-[21px] text-[#102A35]">
                {t('privacyBody')}
              </p>
              <p className="text-[13px] leading-[21px] text-[#668087]">
                {t('clearData')} : {t('clearDataConfirm')}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const greetingKey = (hour: number) =>
  hour < 12 ? 'goodMorning' : hour < 18 ? 'goodAfternoon' : 'goodEvening';

function HomeScreen() {
  const colors = useColors();
  const { language, vehicle, records, t, isRTL, updateVehicle, isHydrated } = useSiyantek();
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'history'>('overview');
  const [mileageDraft, setMileageDraft] = useState(() => String(vehicle.mileage));
  const [mileageError, setMileageError] = useState('');

  useEffect(() => {
    if (isHydrated && (!vehicle.brand.trim() || !vehicle.model.trim())) {
      setVehicleModalVisible(true);
    }
  }, [isHydrated, vehicle.brand, vehicle.model]);

  useEffect(() => {
    setMileageDraft(vehicle.mileage > 0 ? String(vehicle.mileage) : '');
  }, [vehicle.mileage]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );
  const latest = sortedRecords[0];
  const nextMileage =
    latest?.nextMileage ?? (latest ? latest.mileage + 5000 : vehicle.mileage + 5000);
  const distanceToNext = Math.max(0, nextMileage - vehicle.mileage);
  const serviceProgress = Math.min(1, Math.max(0, 1 - distanceToNext / 5000));

  const saveMileage = () => {
    const parsedMileage = Number(mileageDraft.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(parsedMileage) || parsedMileage <= 0) {
      setMileageError(t('invalidMileage'));
      return;
    }
    updateVehicle({ ...vehicle, mileage: parsedMileage });
    setMileageDraft(String(parsedMileage));
    setMileageError('');
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F4F7F5] text-[#102A35]"
    >
      <div className="mx-auto max-w-[480px] px-[20px] pt-[28px] pb-[40px]">
        {/* Top Bar */}
        <div className="mb-[28px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <LogoMark />
            <div>
              <div className="text-[20px] font-bold tracking-[-0.4px] text-[#102A35]">
                {t('appName')}
              </div>
              <div className="mt-[2px] text-[10px] font-medium text-[#668087]">
                {t('tagline')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            <LanguagePicker />
            <button
              type="button"
              onClick={() => setSettingsVisible(true)}
              aria-label={t('settings')}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-[18px] border border-[#DCE7E3] bg-white"
            >
              <Settings size={17} color={colors.foreground} />
            </button>
          </div>
        </div>

        {/* Welcome Row */}
        <div className="mb-[18px] flex items-end justify-between">
          <div>
            <div className="mb-[5px] text-[11px] font-bold tracking-[1.1px] text-[#16A6A0] uppercase">
              {t(greetingKey(new Date().getHours()))}
            </div>
            <div className="text-[29px] font-bold tracking-[-1px] text-[#102A35]">
              {t('yourCar')}
            </div>
          </div>
          <button
            type="button"
            data-testid="edit-vehicle"
            aria-label={t('editVehicle')}
            onClick={() => setVehicleModalVisible(true)}
            className="flex h-[40px] items-center justify-center gap-[7px] rounded-[14px] border border-[#16A6A0] bg-[#DDF4EF] px-[11px] text-[11px] font-bold text-[#16A6A0] transition-opacity active:opacity-75"
          >
            <Edit2 size={15} color={colors.teal} />
            <span>{t('editVehicle')}</span>
          </button>
        </div>

        {/* Vehicle Hero Card */}
        <div
          onClick={() => setVehicleModalVisible(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setVehicleModalVisible(true)}
          className="relative flex min-h-[142px] cursor-pointer items-center justify-between overflow-hidden rounded-[25px] bg-[#102A35] p-[22px]"
        >
          <div className="z-10 flex flex-col justify-between gap-[10px]">
            <div className="text-[10px] font-bold tracking-[1.1px] text-[#A7C8C6]">
              {vehicle.brand
                ? `${vehicle.brand.toUpperCase()}${vehicle.year ? ` · ${vehicle.year}` : ''}`
                : t('noVehicle')}
            </div>
            <div className="text-[33px] leading-tight font-bold tracking-[-1px] text-white">
              {vehicle.model || t('noVehicle')}
            </div>
            <div className="flex items-center gap-[7px]">
              <CreditCard size={13} color={colors.amber} />
              <span className="text-[12px] font-semibold text-[#D4E7E4]">
                {vehicle.plate || t('noVehicleHint')}
              </span>
            </div>
          </div>
          <div className="relative flex items-center justify-center -rotate-6">
            <div className="absolute h-[95px] w-[95px] rounded-full bg-[#16A6A0] opacity-16" />
            <Car size={68} color={colors.teal} strokeWidth={1.75} />
          </div>
        </div>

        {/* View Switch */}
        <div className="mx-auto my-[22px] flex w-[74%] rounded-[14px] bg-[#E7EFEC] p-[3px]">
          {(['overview', 'history'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`flex-1 rounded-[11px] py-[9px] text-center text-[12px] font-bold transition-colors ${
                viewMode === mode ? 'bg-white text-[#102A35]' : 'text-[#668087]'
              }`}
            >
              {t(mode)}
            </button>
          ))}
        </div>

        {viewMode === 'overview' ? (
          <>
            {/* Mileage Card */}
            <div className="rounded-[22px] border border-[#DCE7E3] bg-white p-[19px]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-[4px] text-[11px] font-semibold text-[#668087]">
                    {t('currentMileage')}
                  </div>
                  <div className="flex items-baseline gap-[7px]">
                    <span className="text-[32px] font-bold tracking-[-1px] text-[#102A35]">
                      {formatLocalizedNumber(vehicle.mileage, language)}
                    </span>
                    <span className="text-[13px] font-bold text-[#16A6A0]">
                      {t('kilometers')}
                    </span>
                  </div>
                </div>
                <div className="flex h-[28px] items-center gap-[4px] rounded-[12px] bg-[#E2F5EB] px-[9px]">
                  <TrendingUp size={14} color={colors.green} />
                  <span className="text-[11px] font-bold text-[#2B9A70]">
                    +{formatLocalizedNumber(240, language)}
                  </span>
                </div>
              </div>

              <div className="mt-[16px] flex items-center gap-[8px]">
                <div className="flex min-h-[43px] flex-1 items-center gap-[8px] rounded-[12px] border border-[#D2E1DC] bg-[#F3F8F6] px-[12px]">
                  <Edit3 size={14} color={colors.teal} />
                  <input
                    data-testid="dashboard-mileage-input"
                    type="text"
                    inputMode="numeric"
                    value={mileageDraft}
                    onChange={(e) => {
                      setMileageDraft(e.target.value);
                      setMileageError('');
                    }}
                    placeholder={t('enterMileage')}
                    className="min-h-[41px] flex-1 bg-transparent text-[14px] font-bold text-[#102A35] placeholder-[#668087] outline-none"
                  />
                </div>
                <button
                  type="button"
                  data-testid="dashboard-mileage-save"
                  aria-label={t('updateMileage')}
                  onClick={saveMileage}
                  className="flex h-[43px] w-[45px] items-center justify-center rounded-[12px] bg-[#16A6A0] transition-opacity active:opacity-80"
                >
                  <Check size={16} color="#ffffff" />
                </button>
              </div>
              {mileageError ? (
                <div className="mt-[5px] text-[10px] font-semibold text-[#C94E4E]">
                  {mileageError}
                </div>
              ) : null}

              <div className="mt-[19px] h-[8px] overflow-hidden rounded-[5px] bg-[#E9F0ED]">
                <div
                  className="h-[8px] rounded-[5px] bg-[#16A6A0] transition-all"
                  style={{ width: `${Math.max(8, serviceProgress * 100)}%` }}
                />
              </div>
              <div className="mt-[9px] flex justify-between">
                <span className="text-[10px] font-semibold text-[#668087]">
                  {t('lastService')} · {latest ? dateLabel(latest.date, language) : '—'}
                </span>
                <span className="text-[10px] font-semibold text-[#16A6A0]">
                  {t('nextService')} · {formatLocalizedNumber(nextMileage, language)}{' '}
                  {t('kilometers')}
                </span>
              </div>
            </div>

            {/* Stat Pills */}
            <div className="mt-[11px] flex gap-[10px]">
              <StatPill
                icon={CheckCircle2}
                label={t('vehicleHealth')}
                value={t('onTrack')}
              />
              <StatPill
                icon={Calendar}
                label={t('nextService')}
                value={
                  distanceToNext > 0
                    ? `${formatLocalizedNumber(distanceToNext, language)} ${t('kilometers')}`
                    : t('allCaughtUp')
                }
              />
            </div>

            {/* Add Maintenance Button */}
            <button
              type="button"
              data-testid="add-maintenance"
              onClick={() => setModalVisible(true)}
              className="mt-[14px] flex w-full items-center justify-center gap-[10px] rounded-[18px] bg-[#F2B45C] p-[15px] transition-opacity active:opacity-85"
            >
              <div className="flex h-[27px] w-[27px] items-center justify-center rounded-[9px] border border-[#102A35]">
                <Plus size={20} color={colors.navy} />
              </div>
              <span className="flex-1 text-start text-[14px] font-bold text-[#102A35]">
                {t('addMaintenance')}
              </span>
              {isRTL ? (
                <ArrowLeft size={19} color={colors.navy} />
              ) : (
                <ArrowRight size={19} color={colors.navy} />
              )}
            </button>

            {/* Recent Activity */}
            <div className="mt-[27px] mb-[11px] flex items-center justify-between">
              <div className="text-[17px] font-bold tracking-[-0.3px] text-[#102A35]">
                {t('recentActivity')}
              </div>
              <button
                type="button"
                onClick={() => setViewMode('history')}
                className="text-[11px] font-bold text-[#16A6A0]"
              >
                {t('history')}
              </button>
            </div>

            {sortedRecords.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className="mb-[9px] flex items-center gap-[11px] rounded-[16px] border border-[#DCE7E3] bg-white p-[12px]"
              >
                <TypeIcon type={record.type} />
                <div className="flex-1">
                  <div className="mb-[3px] text-[13px] font-bold text-[#102A35]">
                    {t(record.type)}
                  </div>
                  <div className="text-[10px] font-medium text-[#668087]">
                    {dateLabel(record.date, language)} ·{' '}
                    {formatLocalizedNumber(record.mileage, language)} {t('kilometers')}
                  </div>
                </div>
                {record.cost > 0 ? (
                  <div className="text-[12px] font-bold text-[#102A35]">
                    {formatLocalizedNumber(record.cost, language)} DT
                  </div>
                ) : null}
              </div>
            ))}

            {sortedRecords.length === 0 ? (
              <div className="flex flex-col items-center rounded-[17px] border border-[#DCE7E3] bg-white p-[24px]">
                <ClipboardList size={24} color={colors.teal} />
                <div className="mt-[10px] text-[14px] font-bold text-[#102A35]">
                  {t('noRecords')}
                </div>
                <div className="mt-[5px] max-w-[250px] text-center text-[11px] leading-[17px] text-[#668087]">
                  {t('noRecordsHint')}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div>
            <div className="mb-[13px] flex items-baseline justify-between">
              <div className="text-[17px] font-bold tracking-[-0.3px] text-[#102A35]">
                {t('maintenanceHistory')}
              </div>
              <div className="text-[11px] font-semibold text-[#668087]">
                {records.length} {t('recordCount')}
              </div>
            </div>
            {sortedRecords.map((record) => (
              <div
                key={record.id}
                className="mb-[10px] flex items-center gap-[11px] rounded-[17px] border border-[#DCE7E3] bg-white p-[13px]"
              >
                <TypeIcon type={record.type} />
                <div className="flex-1">
                  <div className="mb-[3px] text-[13px] font-bold text-[#102A35]">
                    {t(record.type)}
                  </div>
                  <div className="text-[10px] font-medium text-[#668087]">
                    {dateLabel(record.date, language)} ·{' '}
                    {formatLocalizedNumber(record.mileage, language)} {t('kilometers')}
                  </div>
                  {record.notes ? (
                    <div className="mt-[6px] text-[10px] text-[#668087]">{record.notes}</div>
                  ) : null}
                </div>
                {record.cost > 0 ? (
                  <div className="text-[12px] font-bold text-[#102A35]">
                    {formatLocalizedNumber(record.cost, language)} DT
                  </div>
                ) : null}
              </div>
            ))}
            {sortedRecords.length === 0 ? (
              <div className="flex flex-col items-center rounded-[17px] border border-[#DCE7E3] bg-white p-[24px]">
                <ClipboardList size={24} color={colors.teal} />
                <div className="mt-[10px] text-[14px] font-bold text-[#102A35]">
                  {t('noRecords')}
                </div>
                <div className="mt-[5px] max-w-[250px] text-center text-[11px] leading-[17px] text-[#668087]">
                  {t('noRecordsHint')}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Offline Footer */}
        <div className="mt-[25px] flex items-center justify-center gap-[6px]">
          <WifiOff size={14} color={colors.mutedForeground} />
          <span className="text-[10px] font-semibold text-[#668087]">{t('offline')}</span>
          {latest ? (
            <span className="text-[10px] font-semibold text-[#668087]">
              · {daysSince(latest.date)} {t('ago')}
            </span>
          ) : null}
        </div>
      </div>

      <AddMaintenanceModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <VehicleModal
        visible={vehicleModalVisible}
        onClose={() => setVehicleModalVisible(false)}
        onSaved={(mileage) => setMileageDraft(String(mileage))}
      />
      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SiyantekProvider>
      <HomeScreen />
    </SiyantekProvider>
  );
}
