import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'fr' | 'ar';
export type MaintenanceType = 'oil' | 'brakes' | 'tires' | 'inspection' | 'battery' | 'other';

export interface Vehicle {
  brand: string;
  model: string;
  year: string;
  plate: string;
  mileage: number;
}

export interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  date: string;
  mileage: number;
  cost: number;
  notes: string;
  nextMileage?: number;
}

const MAINTENANCE_TYPES: MaintenanceType[] = [
  'oil',
  'brakes',
  'tires',
  'inspection',
  'battery',
  'other',
];

const isLanguage = (value: unknown): value is Language =>
  value === 'en' || value === 'fr' || value === 'ar';

const normalizeRecord = (value: unknown, index: number): MaintenanceRecord | null => {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<MaintenanceRecord>;
  const mileage = Number(candidate.mileage);
  const cost = Number(candidate.cost);
  const nextMileage = candidate.nextMileage == null ? undefined : Number(candidate.nextMileage);

  if (
    typeof candidate.id !== 'string' ||
    !MAINTENANCE_TYPES.includes(candidate.type as MaintenanceType) ||
    typeof candidate.date !== 'string' ||
    !Number.isFinite(mileage) ||
    mileage <= 0 ||
    !Number.isFinite(cost) ||
    cost < 0 ||
    typeof candidate.notes !== 'string'
  ) {
    return null;
  }

  return {
    id: candidate.id || `record-${index}`,
    type: candidate.type as MaintenanceType,
    date: candidate.date,
    mileage,
    cost,
    notes: candidate.notes,
    nextMileage:
      nextMileage !== undefined && Number.isFinite(nextMileage) && nextMileage > mileage
        ? nextMileage
        : undefined,
  };
};

const normalizeState = (candidate: unknown): SiyantekState => {
  if (!candidate || typeof candidate !== 'object') return initialState;

  const source = candidate as Partial<SiyantekState>;
  const candidateMileage = Number(source.vehicle?.mileage);
  const records = Array.isArray(source.records)
    ? source.records
        .map(normalizeRecord)
        .filter((record): record is MaintenanceRecord => record !== null)
    : initialState.records;

  return {
    language: isLanguage(source.language) ? source.language : initialState.language,
    vehicle: {
      ...initialState.vehicle,
      ...(source.vehicle ?? {}),
      mileage:
        Number.isFinite(candidateMileage) && candidateMileage >= 0
          ? candidateMileage
          : initialState.vehicle.mileage,
    },
    records,
  };
};

interface SiyantekState {
  language: Language;
  vehicle: Vehicle;
  records: MaintenanceRecord[];
}

interface SiyantekContextValue extends SiyantekState {
  isHydrated: boolean;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  addRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  t: (key: string) => string;
  resetAllData: () => Promise<void>;
}

const STORAGE_KEY = '@siyantek/state-v2';

const initialState: SiyantekState = {
  language: 'fr',
  vehicle: {
    brand: '',
    model: '',
    year: '',
    plate: '',
    mileage: 0,
  },
  records: [],
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'Siyantek',
    tagline: 'Care for every kilometre.',
    overview: 'Overview',
    history: 'Records',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    yourCar: 'Your vehicle',
    currentMileage: 'Current mileage',
    updateMileage: 'Update the odometer',
    kilometers: 'km',
    lastService: 'Last service',
    ago: 'ago',
    nextService: 'Next service',
    dueIn: 'Due in',
    allCaughtUp: 'All caught up',
    addMaintenance: 'Add maintenance',
    recentActivity: 'Recent activity',
    noRecords: 'No maintenance recorded yet.',
    noRecordsHint: 'Keep your first service here so your car’s story stays complete.',
    maintenanceHistory: 'Maintenance history',
    recordCount: 'records',
    vehicleHealth: 'Vehicle health',
    onTrack: 'On track',
    service: 'Service',
    date: 'Date',
    mileage: 'Mileage',
    cost: 'Cost',
    notes: 'Notes',
    nextMileage: 'Next service at',
    saveMaintenance: 'Save maintenance',
    cancel: 'Cancel',
    addServiceTitle: 'Log a service',
    serviceType: 'What was done?',
    oil: 'Oil & filter',
    brakes: 'Brakes',
    tires: 'Tires',
    inspection: 'Inspection',
    battery: 'Battery',
    other: 'Other',
    enterMileage: 'Enter mileage',
    enterCost: 'Cost (optional)',
    addNotes: 'Add a note (optional)',
    enterNextMileage: 'Next service mileage (optional)',
    requiredMileage: 'Please enter the mileage.',
    invalidMileage: 'Mileage must be a positive number.',
    invalidNextMileage: 'Next service mileage must be greater than the current mileage.',
    language: 'Language',
    offline: 'Saved offline',
    today: 'Today',
    editVehicle: 'Edit vehicle',
    vehicleDetails: 'Vehicle details',
    saveChanges: 'Save changes',
    brand: 'Brand',
    model: 'Model',
    year: 'Year',
    plate: 'Plate number',
    close: 'Close',
    settings: 'Settings',
    privacy: 'Privacy policy',
    privacyTitle: 'Privacy & data',
    privacyBody: 'Siyantek stores your vehicle and maintenance information locally on your device. The app does not require an account and does not send your maintenance data to a Siyantek server. You can clear all locally stored app data at any time from Settings.',
    clearData: 'Clear all data',
    clearDataConfirm: 'This will permanently remove your vehicle and maintenance records from this device. Continue?',
    clearDataDone: 'Your local data has been cleared.',
    setupTitle: 'Set up your vehicle',
    setupHint: 'Add your vehicle details to start tracking maintenance.',
    requiredVehicle: 'Please enter the vehicle brand and model.',
    noVehicle: 'Add your vehicle',
    noVehicleHint: 'Set up your vehicle to start tracking maintenance.',
    appVersion: 'Version',
  },
  fr: {
    appName: 'Siyantek',
    tagline: 'Prenez soin de chaque kilomètre.',
    overview: 'Aperçu',
    history: 'Historique',
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon après-midi',
    goodEvening: 'Bonsoir',
    yourCar: 'Votre véhicule',
    currentMileage: 'Kilométrage actuel',
    updateMileage: 'Mettre à jour le compteur',
    kilometers: 'km',
    lastService: 'Dernier entretien',
    ago: 'il y a',
    nextService: 'Prochain entretien',
    dueIn: 'Dans',
    allCaughtUp: 'Tout est à jour',
    addMaintenance: 'Ajouter un entretien',
    recentActivity: 'Activité récente',
    noRecords: 'Aucun entretien enregistré.',
    noRecordsHint: 'Ajoutez votre premier entretien pour garder un historique complet.',
    maintenanceHistory: 'Historique des entretiens',
    recordCount: 'entretiens',
    vehicleHealth: 'État du véhicule',
    onTrack: 'Tout va bien',
    service: 'Entretien',
    date: 'Date',
    mileage: 'Kilométrage',
    cost: 'Coût',
    notes: 'Notes',
    nextMileage: 'Prochain entretien à',
    saveMaintenance: 'Enregistrer',
    cancel: 'Annuler',
    addServiceTitle: 'Ajouter un entretien',
    serviceType: 'Qu’avez-vous fait ?',
    oil: 'Huile et filtre',
    brakes: 'Freins',
    tires: 'Pneus',
    inspection: 'Contrôle',
    battery: 'Batterie',
    other: 'Autre',
    enterMileage: 'Saisir le kilométrage',
    enterCost: 'Coût (facultatif)',
    addNotes: 'Ajouter une note (facultatif)',
    enterNextMileage: 'Prochain kilométrage (facultatif)',
    requiredMileage: 'Veuillez saisir le kilométrage.',
    invalidMileage: 'Le kilométrage doit être positif.',
    invalidNextMileage: 'Le prochain kilométrage doit être supérieur au kilométrage actuel.',
    language: 'Langue',
    offline: 'Enregistré hors ligne',
    today: 'Aujourd’hui',
    editVehicle: 'Modifier le véhicule',
    vehicleDetails: 'Détails du véhicule',
    saveChanges: 'Enregistrer les changements',
    brand: 'Marque',
    model: 'Modèle',
    year: 'Année',
    plate: 'Immatriculation',
    close: 'Fermer',
    settings: 'Paramètres',
    privacy: 'Politique de confidentialité',
    privacyTitle: 'Confidentialité et données',
    privacyBody: 'Siyantek enregistre les informations de votre véhicule et de vos entretiens uniquement sur votre appareil. Aucun compte n’est requis et vos données d’entretien ne sont pas envoyées à un serveur Siyantek. Vous pouvez effacer toutes les données locales à tout moment depuis les paramètres.',
    clearData: 'Effacer toutes les données',
    clearDataConfirm: 'Cette action supprimera définitivement votre véhicule et votre historique de cet appareil. Continuer ?',
    clearDataDone: 'Vos données locales ont été supprimées.',
    setupTitle: 'Configurez votre véhicule',
    setupHint: 'Ajoutez les informations de votre véhicule pour commencer le suivi.',
    requiredVehicle: 'Veuillez saisir la marque et le modèle du véhicule.',
    noVehicle: 'Ajouter votre véhicule',
    noVehicleHint: 'Configurez votre véhicule pour commencer le suivi.',
    appVersion: 'Version',
  },
  ar: {
    appName: 'صيانتك',
    tagline: 'اعتنِ بكل كيلومتر.',
    overview: 'نظرة عامة',
    history: 'السجل',
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء الخير',
    yourCar: 'سيارتك',
    currentMileage: 'المسافة الحالية',
    updateMileage: 'تحديث العداد',
    kilometers: 'كم',
    lastService: 'آخر صيانة',
    ago: 'منذ',
    nextService: 'الصيانة القادمة',
    dueIn: 'بعد',
    allCaughtUp: 'كل شيء على ما يرام',
    addMaintenance: 'إضافة صيانة',
    recentActivity: 'النشاط الأخير',
    noRecords: 'لم يتم تسجيل أي صيانة بعد.',
    noRecordsHint: 'أضف أول صيانة للحفاظ على سجل سيارتك.',
    maintenanceHistory: 'سجل الصيانة',
    recordCount: 'عمليات',
    vehicleHealth: 'حالة السيارة',
    onTrack: 'في الموعد',
    service: 'صيانة',
    date: 'التاريخ',
    mileage: 'المسافة',
    cost: 'التكلفة',
    notes: 'ملاحظات',
    nextMileage: 'الصيانة القادمة عند',
    saveMaintenance: 'حفظ الصيانة',
    cancel: 'إلغاء',
    addServiceTitle: 'تسجيل صيانة',
    serviceType: 'ما الذي تم؟',
    oil: 'الزيت والفلتر',
    brakes: 'الفرامل',
    tires: 'الإطارات',
    inspection: 'الفحص',
    battery: 'البطارية',
    other: 'أخرى',
    enterMileage: 'أدخل المسافة',
    enterCost: 'التكلفة (اختياري)',
    addNotes: 'أضف ملاحظة (اختياري)',
    enterNextMileage: 'مسافة الصيانة القادمة (اختياري)',
    requiredMileage: 'يرجى إدخال المسافة.',
    invalidMileage: 'يجب أن تكون المسافة رقماً موجباً.',
    invalidNextMileage: 'يجب أن تكون مسافة الصيانة القادمة أكبر من المسافة الحالية.',
    language: 'اللغة',
    offline: 'محفوظ دون اتصال',
    today: 'اليوم',
    editVehicle: 'تعديل السيارة',
    vehicleDetails: 'بيانات السيارة',
    saveChanges: 'حفظ التغييرات',
    brand: 'العلامة',
    model: 'الطراز',
    year: 'السنة',
    plate: 'رقم التسجيل',
    close: 'إغلاق',
    settings: 'الإعدادات',
    privacy: 'سياسة الخصوصية',
    privacyTitle: 'الخصوصية والبيانات',
    privacyBody: 'يخزن تطبيق صيانتك معلومات السيارة وسجل الصيانة محلياً على جهازك. لا يحتاج التطبيق إلى إنشاء حساب، ولا يرسل بيانات الصيانة إلى خادم صيانتك. يمكنك حذف جميع البيانات المحلية في أي وقت من الإعدادات.',
    clearData: 'حذف جميع البيانات',
    clearDataConfirm: 'سيؤدي هذا إلى حذف السيارة وسجل الصيانة نهائياً من هذا الجهاز. هل تريد المتابعة؟',
    clearDataDone: 'تم حذف بياناتك المحلية.',
    setupTitle: 'إعداد سيارتك',
    setupHint: 'أضف بيانات سيارتك لبدء متابعة الصيانة.',
    requiredVehicle: 'يرجى إدخال علامة السيارة وطرازها.',
    noVehicle: 'أضف سيارتك',
    noVehicleHint: 'قم بإعداد سيارتك لبدء متابعة الصيانة.',
    appVersion: 'الإصدار',
  },
};

const formatNumber = (value: number, language: Language) =>
  new Intl.NumberFormat(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US').format(value);

export const formatLocalizedNumber = formatNumber;

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const SiyantekContext = createContext<SiyantekContextValue | null>(null);

export function SiyantekProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SiyantekState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(normalizeState(JSON.parse(stored) as Partial<SiyantekState>));
      }
    } catch {
      setState(initialState);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage write errors
      }
    }
  }, [isHydrated, state]);

  const value = useMemo<SiyantekContextValue>(() => ({
    ...state,
    isHydrated,
    isRTL: state.language === 'ar',
    setLanguage: (language) => setState((current) => ({ ...current, language })),
    updateVehicle: (vehicle) => setState((current) => ({
      ...current,
      vehicle: {
        ...vehicle,
        mileage: vehicle.mileage > 0 ? vehicle.mileage : current.vehicle.mileage,
      },
    })),
    addRecord: (record) => setState((current) => ({
      ...current,
      records: [{ ...record, id: makeId() }, ...current.records],
      vehicle: { ...current.vehicle, mileage: Math.max(current.vehicle.mileage, record.mileage) },
    })),
    resetAllData: async () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
      setState((current) => ({ ...initialState, language: current.language }));
    },
    t: (key) => translations[state.language]?.[key] ?? translations.en[key] ?? key,
  }), [isHydrated, state]);

  return <SiyantekContext.Provider value={value}>{children}</SiyantekContext.Provider>;
}

export function useSiyantek() {
  const context = useContext(SiyantekContext);
  if (!context) throw new Error('useSiyantek must be used inside SiyantekProvider');
  return context;
}
