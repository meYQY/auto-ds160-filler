import { DS160FormData } from '../types/ds160';

interface StorageData {
  apiKey?: string;
  formData?: DS160FormData | null;
  logs?: string[];
}

export const saveToStorage = (data: Partial<StorageData>): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
};

export const loadFromStorage = (): Promise<StorageData> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey', 'formData', 'logs'], (result) => {
      resolve(result as StorageData);
    });
  });
};

export const clearStorage = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
};

