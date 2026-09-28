import { JWT } from 'google-auth-library';
import { LogEntry, SourceType } from '../src/types';

// In-memory store for VibeCoffeeLogs
const LOGS_STORE: LogEntry[] = [];

let cachedAuthClient: JWT | null = null;
let lastSyncTimestamp: string = new Date().toISOString();
let remoteSyncStatus: 'synced_remote' | 'active_local' | 'error_fallback' = 'active_local';
let lastRemoteError: string | null = null;
let headersInitialized = false;

const REQUIRED_HEADERS = [
  'ID',
  'Дата и время (МСК)',
  'Вопрос клиента',
  'Ответ консультанта',
  'Источник данных',
  'Категория',
  'Рекомендованный товар',
  'Модель / Fallback',
  'Время ответа',
];

/**
 * Extracts pure Sheet ID from either plain ID or full URL
 */
function extractSheetId(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Gets or creates JWT Google Auth client
 */
function getAuthClient(): JWT | null {
  if (cachedAuthClient) return cachedAuthClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !key) return null;

  key = key.replace(/\\n/g, '\n');

  try {
    cachedAuthClient = new JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return cachedAuthClient;
  } catch (err) {
    console.warn('[Google Sheets Logger] Failed to init JWT client:', err);
    return null;
  }
}

/**
 * Gets valid OAuth access token for Google Sheets API v4
 */
async function getAccessToken(): Promise<string | null> {
  const client = getAuthClient();
  if (!client) return null;

  try {
    const tokenRes = await client.getAccessToken();
    return tokenRes?.token || null;
  } catch (err: any) {
    console.warn('[Google Sheets Logger] Failed to obtain access token:', err?.message || err);
    return null;
  }
}

/**
 * Checks and creates required column headers in VibeCoffeeLogs if they don't exist
 */
async function ensureHeadersExist(sheetId: string, token: string): Promise<string> {
  // 1. Get spreadsheet metadata to know first sheet title & sheetId
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaRes.ok) {
    throw new Error(`Failed to fetch spreadsheet metadata: ${metaRes.statusText}`);
  }

  const meta = await metaRes.json();
  const firstSheet = meta.sheets?.[0];
  const sheetTitle = firstSheet?.properties?.title || 'Sheet1';
  const numericSheetId = firstSheet?.properties?.sheetId || 0;

  // 2. Check current row 1 values
  const rowRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetTitle)}!A1:I1`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  let needHeaders = true;
  if (rowRes.ok) {
    const rowData = await rowRes.json();
    if (rowData.values && rowData.values.length > 0 && rowData.values[0].length >= 5) {
      needHeaders = false;
    }
  }

  if (needHeaders) {
    console.log(`[Google Sheets Logger] Creating required headers in sheet "${sheetTitle}"...`);
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetTitle)}!A1:I1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [REQUIRED_HEADERS],
        }),
      }
    );

    if (!updateRes.ok) {
      console.warn('[Google Sheets Logger] Header row write warning:', await updateRes.text());
    }

    // Format header row (bold, coffee accent background, frozen top row)
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: numericSheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 9,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.95, green: 0.91, blue: 0.85 }, // #F2E8D9
                    textFormat: { bold: true, fontSize: 10, foregroundColor: { red: 0.25, green: 0.16, blue: 0.1 } },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
            {
              updateSheetProperties: {
                properties: {
                  sheetId: numericSheetId,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
                fields: 'gridProperties.frozenRowCount',
              },
            },
          ],
        }),
      });
    } catch (fmtErr) {
      console.warn('[Google Sheets Logger] Header formatting non-fatal warning:', fmtErr);
    }
  }

  headersInitialized = true;
  return sheetTitle;
}

export interface LogPayload {
  question: string;
  answer: string;
  source: SourceType | string;
  duration: string;
  category: string;
  recommendedProductId?: string;
  recommendedProductName?: string;
  modelUsed?: string;
}

/**
 * Logs a question and answer into VibeCoffeeLogs.
 * Writes to both local cache and appends a new row directly into GOOGLE_SHEETS_LOGS_ID.
 */
export async function logQuestionAnswer(
  payload: LogPayload
): Promise<{ success: boolean; logId: string; remoteSynced: boolean; error?: string }> {
  const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const nowFormatted = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const entry: LogEntry = {
    id: logId,
    date: nowFormatted,
    question: payload.question.trim(),
    answer: payload.answer.trim(),
    source: payload.source,
    duration: payload.duration,
    category: payload.category || 'другое',
    recommendedProductId: payload.recommendedProductId,
    recommendedProductName: payload.recommendedProductName,
    modelUsed: payload.modelUsed,
  };

  // 1. Immediately store in local log registry
  LOGS_STORE.unshift(entry);
  if (LOGS_STORE.length > 500) {
    LOGS_STORE.pop();
  }

  // 2. Append directly to Google Sheet VibeCoffeeLogs (GOOGLE_SHEETS_LOGS_ID)
  let remoteSynced = false;
  let remoteError: string | undefined;

  const rawSheetId = process.env.GOOGLE_SHEETS_LOGS_ID;
  const sheetId = rawSheetId ? extractSheetId(rawSheetId) : null;

  if (sheetId && sheetId !== 'VibeCoffeeLogs' && sheetId.length > 15) {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Service account token unavailable');
      }

      // Ensure headers exist on first write
      const sheetTitle = await ensureHeadersExist(sheetId, token);

      // Append row to sheet
      const rowValues = [
        entry.id,
        entry.date,
        entry.question,
        entry.answer,
        entry.source,
        entry.category,
        entry.recommendedProductName || entry.recommendedProductId || '—',
        entry.modelUsed || 'gemini-3.6-flash',
        entry.duration,
      ];

      const appendRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetTitle)}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowValues],
          }),
        }
      );

      if (appendRes.ok) {
        remoteSynced = true;
        remoteSyncStatus = 'synced_remote';
        lastSyncTimestamp = new Date().toISOString();
        console.log(`[Google Sheets Logger] Successfully appended row ${entry.id} to VibeCoffeeLogs (${sheetId})`);
      } else {
        const errText = await appendRes.text();
        throw new Error(`Append failed (${appendRes.status}): ${errText}`);
      }
    } catch (err: any) {
      remoteError = err?.message || 'Remote append error';
      remoteSyncStatus = 'error_fallback';
      lastRemoteError = remoteError || null;
      console.warn('[Google Sheets Logger] Remote append error (non-fatal):', remoteError);
    }
  }

  return {
    success: true,
    logId,
    remoteSynced,
    error: remoteError,
  };
}

/**
 * Fetches latest logs directly from Google Sheets (VibeCoffeeLogs)
 */
export async function getLiveLogs(): Promise<{
  logs: LogEntry[];
  total: number;
  sheetName: string;
  remoteSynced: boolean;
}> {
  const rawSheetId = process.env.GOOGLE_SHEETS_LOGS_ID;
  const sheetId = rawSheetId ? extractSheetId(rawSheetId) : null;

  if (sheetId && sheetId !== 'VibeCoffeeLogs' && sheetId.length > 15) {
    try {
      const token = await getAccessToken();
      if (token) {
        const sheetTitle = await ensureHeadersExist(sheetId, token);
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetTitle)}!A2:I500`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rows: string[][] = data.values || [];
          if (rows.length > 0) {
            const remoteEntries: LogEntry[] = rows
              .map((row, idx) => ({
                id: row[0] || `remote-${idx}`,
                date: row[1] || '—',
                question: row[2] || '',
                answer: row[3] || '',
                source: (row[4] as SourceType) || 'Google Sheets',
                category: row[5] || 'другое',
                recommendedProductName: row[6] || '',
                modelUsed: row[7] || '',
                duration: row[8] || '',
              }))
              .filter((e) => e.question && e.answer)
              .reverse(); // Newest first

            return {
              logs: remoteEntries,
              total: remoteEntries.length,
              sheetName: `Google Sheets (VibeCoffeeLogs ID: ${sheetId.slice(0, 6)}...${sheetId.slice(-4)})`,
              remoteSynced: true,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn('[Google Sheets Logger] Error reading remote logs, returning memory store:', err?.message);
    }
  }

  return {
    logs: [...LOGS_STORE],
    total: LOGS_STORE.length,
    sheetName: 'VibeCoffeeLogs',
    remoteSynced: remoteSyncStatus === 'synced_remote',
  };
}

export function getAllLogs(): LogEntry[] {
  return [...LOGS_STORE];
}

export function clearAllLogs(): void {
  LOGS_STORE.length = 0;
}

export function getLogsSyncMeta() {
  const rawSheetId = process.env.GOOGLE_SHEETS_LOGS_ID;
  return {
    sheetId: rawSheetId || 'VibeCoffeeLogs',
    totalLogs: LOGS_STORE.length,
    status: remoteSyncStatus,
    lastSync: lastSyncTimestamp,
    lastError: lastRemoteError,
    serviceAccountConnected: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
  };
}
