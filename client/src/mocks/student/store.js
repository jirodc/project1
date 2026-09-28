import { initialDocumentRequests } from './documents.js';
import { buildInitialNotifications } from './notifications.js';
import { defaultNotificationPreferences } from './profile.js';

/**
 * The parts of the mock data a student can change (profile edits, document
 * requests, notifications). Persisted to localStorage so changes survive a
 * reload; everything else in /mocks is read-only.
 */
const STORAGE_KEY = 'ctms.studentPortal.v1';

const createInitialState = () => ({
  profile: {},
  photo: null,
  notifications: buildInitialNotifications(),
  documentRequests: initialDocumentRequests,
  preferences: defaultNotificationPreferences,
});

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...createInitialState(), ...JSON.parse(saved) };
  } catch {
    // Storage unavailable or corrupted: start fresh.
  }
  return createInitialState();
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: changes last until the page is reloaded.
  }
}

let state = load();
const listeners = new Set();

export const studentStore = {
  getState: () => state,

  update(updater) {
    state = updater(state);
    save(state);
    listeners.forEach((listener) => listener());
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
