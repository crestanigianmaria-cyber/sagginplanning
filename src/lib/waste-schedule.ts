export type WasteCode = 'S' | 'PM' | 'C';
export type WasteEntryType = WasteCode | 'NESSUNO';

export interface WasteCollectionEntry {
  /** Data di ritiro (YYYY-MM-DD) */
  collectionDate: string;
  type: WasteEntryType;
  /** Etichetta descrittiva (es. "Secco (S)", "Plastica (PM)", "Carta (C)", "Nessun ritiro di C, PM o S") */
  label: string;
}

export interface WasteEveningReminder {
  /** Giorno PRIMA del ritiro: data della sera in cui portare fuori i bidoni (YYYY-MM-DD) */
  reminderDate: string;
  /** Data effettiva del ritiro mattutino (YYYY-MM-DD) */
  collectionDate: string;
  type: WasteCode;
  label: string;
  shortLabel: string;
  eveningTitle: string;
  eveningAction: string;
  reminderDateFormatted: string;
  collectionDateFormatted: string;
  collectionDateShort: string;
}

export const WASTE_TYPE_META: Record<
  WasteCode,
  {
    code: WasteCode;
    name: string;
    label: string;
    shortLabel: string;
    pillClass: string;
    pillSelectedClass: string;
    bannerClass: string;
    accentBadgeClass: string;
    dotClass: string;
  }
> = {
  S: {
    code: 'S',
    name: 'Secco',
    label: 'Secco (S)',
    shortLabel: 'Secco (S)',
    pillClass: 'bg-slate-800 text-white border-slate-700',
    pillSelectedClass: 'bg-white text-slate-900 border-white',
    bannerClass: 'bg-slate-100 border-slate-300 text-slate-900',
    accentBadgeClass: 'bg-slate-800 text-white',
    dotClass: 'bg-slate-700',
  },
  PM: {
    code: 'PM',
    name: 'Plastica',
    label: 'Plastica (PM)',
    shortLabel: 'Plastica (PM)',
    pillClass: 'bg-amber-100 text-amber-950 border-amber-300',
    pillSelectedClass: 'bg-amber-300 text-amber-950 border-amber-200',
    bannerClass: 'bg-amber-50 border-amber-300 text-amber-950',
    accentBadgeClass: 'bg-amber-500 text-white',
    dotClass: 'bg-amber-500',
  },
  C: {
    code: 'C',
    name: 'Carta',
    label: 'Carta (C)',
    shortLabel: 'Carta (C)',
    pillClass: 'bg-blue-100 text-blue-900 border-blue-300',
    pillSelectedClass: 'bg-blue-200 text-blue-950 border-blue-100',
    bannerClass: 'bg-blue-50 border-blue-300 text-blue-950',
    accentBadgeClass: 'bg-blue-600 text-white',
    dotClass: 'bg-blue-600',
  },
};

/**
 * Calendario ufficiale ritiro immondizie (Novembre 2026 – Gennaio 2027).
 * I promemoria "sera prima" vengono generati automaticamente al giorno precedente (collectionDate - 1 giorno).
 */
export const WASTE_COLLECTION_SCHEDULE: WasteCollectionEntry[] = [
  // Novembre 2026
  { collectionDate: '2026-11-12', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2026-11-13', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2026-11-18', type: 'NESSUNO', label: 'Nessun ritiro di C, PM o S' },
  { collectionDate: '2026-11-19', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2026-11-20', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2026-11-24', type: 'C', label: 'Carta (C)' },
  { collectionDate: '2026-11-26', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2026-11-27', type: 'PM', label: 'Plastica (PM)' },

  // Dicembre 2026
  { collectionDate: '2026-12-01', type: 'C', label: 'Carta (C)' },
  { collectionDate: '2026-12-03', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2026-12-04', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2026-12-08', type: 'C', label: 'Carta (C)' },
  { collectionDate: '2026-12-10', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2026-12-11', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2026-12-15', type: 'C', label: 'Carta (C)' },
  { collectionDate: '2026-12-17', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2026-12-18', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2026-12-22', type: 'C', label: 'Carta (C)' },
  { collectionDate: '2026-12-24', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2026-12-26', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2026-12-31', type: 'S', label: 'Secco (S)' },

  // Gennaio 2027
  { collectionDate: '2027-01-01', type: 'NESSUNO', label: 'Nessun ritiro di C, PM o S' },
  { collectionDate: '2027-01-02', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2027-01-05', type: 'C', label: 'Carta (C)' },
  { collectionDate: '2027-01-07', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2027-01-08', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2027-01-13', type: 'NESSUNO', label: 'Nessun ritiro di C, PM o S' },
  { collectionDate: '2027-01-14', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2027-01-15', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2027-01-19', type: 'C', label: 'Carta (C)' },
  { collectionDate: '2027-01-21', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2027-01-22', type: 'PM', label: 'Plastica (PM)' },
  { collectionDate: '2027-01-26', type: 'C', label: 'Carta (C)' },
  { collectionDate: '2027-01-28', type: 'S', label: 'Secco (S)' },
  { collectionDate: '2027-01-29', type: 'PM', label: 'Plastica (PM)' },
];

export function shiftDateStr(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays, 12, 0, 0));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function formatItalianDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const raw = dt.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Rome',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatItalianDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const raw = dt.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'Europe/Rome',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * Restituisce la data odierna in formato YYYY-MM-DD nel fuso orario italiano (Europe/Rome).
 */
export function getItalyDateStr(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function buildReminder(entry: WasteCollectionEntry): WasteEveningReminder | null {
  if (entry.type === 'NESSUNO') return null;
  const meta = WASTE_TYPE_META[entry.type];
  const reminderDate = shiftDateStr(entry.collectionDate, -1);
  return {
    reminderDate,
    collectionDate: entry.collectionDate,
    type: entry.type,
    label: meta.label,
    shortLabel: meta.shortLabel,
    eveningTitle: `Sera: ${meta.name}`,
    eveningAction: `Portare fuori ${meta.name.toUpperCase()} (${meta.code})`,
    reminderDateFormatted: formatItalianDateLong(reminderDate),
    collectionDateFormatted: formatItalianDateLong(entry.collectionDate),
    collectionDateShort: formatItalianDateShort(entry.collectionDate),
  };
}

const EVENING_REMINDERS_LIST: WasteEveningReminder[] = WASTE_COLLECTION_SCHEDULE
  .map(buildReminder)
  .filter((r): r is WasteEveningReminder => r !== null);

const EVENING_REMINDER_MAP = new Map<string, WasteEveningReminder>(
  EVENING_REMINDERS_LIST.map((r) => [r.reminderDate, r])
);

const COLLECTION_DAY_MAP = new Map<string, WasteCollectionEntry>(
  WASTE_COLLECTION_SCHEDULE.map((c) => [c.collectionDate, c])
);

/**
 * Restituisce il promemoria serale per `dateStr` (YYYY-MM-DD), ovvero cosa bisogna
 * portare fuori la sera di `dateStr` perché il ritiro è il giorno successivo.
 */
export function getEveningReminderForDate(dateStr: string): WasteEveningReminder | null {
  if (!dateStr) return null;
  return EVENING_REMINDER_MAP.get(dateStr) || null;
}

/**
 * Restituisce l'eventuale voce di calendario (incluso "Nessun ritiro di C, PM o S")
 * prevista nella giornata `dateStr`.
 */
export function getCollectionEntryForDate(dateStr: string): WasteCollectionEntry | null {
  if (!dateStr) return null;
  return COLLECTION_DAY_MAP.get(dateStr) || null;
}

/**
 * Restituisce tutti i promemoria serali a partire da `fromDateStr` (inclusa).
 */
export function getUpcomingEveningReminders(
  fromDateStr: string = getItalyDateStr(),
  limit?: number
): WasteEveningReminder[] {
  const upcoming = EVENING_REMINDERS_LIST.filter((r) => r.reminderDate >= fromDateStr);
  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
}

/**
 * Restituisce tutto lo storico e i prossimi appuntamenti del calendario (es. per il modale completo).
 */
export function getAllEveningReminders(): WasteEveningReminder[] {
  return EVENING_REMINDERS_LIST;
}
