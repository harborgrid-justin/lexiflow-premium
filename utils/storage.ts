
// LZW Compression Algorithm
const LZW = {
    compress: (uncompressed: string): string => {
        if (!uncompressed) return "";
        const dict: Record<string, number> = {};
        const data = (uncompressed + "").split("");
        const out = [];
        let currChar;
        let phrase = data[0];
        let code = 256;
        for (let i = 1; i < data.length; i++) {
            currChar = data[i];
            if (dict[phrase + currChar] != null) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase = currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        return out.map(c => String.fromCharCode(c)).join("");
    },

    decompress: (compressed: string): string => {
        if (!compressed) return "";
        const dict: Record<number, string> = {};
        const data = (compressed + "").split("");
        let currChar = data[0];
        let oldPhrase = currChar;
        const out = [currChar];
        let code = 256;
        let phrase;
        for (let i = 1; i < data.length; i++) {
            const currCode = data[i].charCodeAt(0);
            if (currCode < 256) {
                phrase = data[i];
            } else {
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = phrase;
        }
        return out.join("");
    }
};

export const STORAGE_KEYS = {
    RULES: 'lexiflow_rules',
    USER_PREFS: 'lexiflow_user_prefs',
    RECENT_FILES: 'lexiflow_recent_files',
    DRAFTS: 'lexiflow_drafts'
};

export const StorageUtils = {
  get: <T>(key: string, defaultData: T): T => {
    try {
      if (typeof window === 'undefined') return defaultData;
      const item = window.localStorage.getItem(key);
      if (!item) return defaultData;

      // Check for compression marker (simple check if it looks like JSON or compressed string)
      // We assume if it doesn't start with [{ or ", it might be compressed
      try {
          return JSON.parse(item);
      } catch (e) {
          // Failed to parse, try decompressing
          try {
              const decompressed = LZW.decompress(item);
              return JSON.parse(decompressed);
          } catch (decompError) {
              console.error(`Storage corruption for ${key}`, decompError);
              return defaultData;
          }
      }
    } catch (error) {
      console.error(`Error reading ${key} from storage`, error);
      return defaultData;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      if (typeof window === 'undefined') return;
      const stringified = JSON.stringify(value);
      // Compress if length > 200 chars to save space
      const toStore = stringified.length > 200 ? LZW.compress(stringified) : stringified;
      window.localStorage.setItem(key, toStore);
    } catch (error) {
      console.error(`Error saving ${key} to storage`, error);
    }
  },

  clearAll: (): void => {
    try {
      if (typeof window === 'undefined') return;
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith('lexiflow_')) {
          window.localStorage.removeItem(key);
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }
};
