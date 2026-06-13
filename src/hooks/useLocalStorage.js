import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "../services/storageService.js";

// BroadcastChannel syncs changes across all open tabs/windows from the same origin.
// This ensures the main dashboard immediately reflects data saved in entry apps.
let _channel = null;
function getChannel() {
  if (!_channel && typeof BroadcastChannel !== "undefined") {
    try {
      _channel = new BroadcastChannel("sekar-milk-sync");
    } catch {
      // ignore — older browsers
    }
  }
  return _channel;
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => readStorage(key, initialValue));

  const setValue = useCallback(
    (valueOrUpdater) => {
      setStoredValue((currentValue) => {
        const nextValue =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(currentValue)
            : valueOrUpdater;

        writeStorage(key, nextValue);

        // Broadcast to all other tabs/apps on the same origin
        const ch = getChannel();
        if (ch) {
          try {
            ch.postMessage({ key, value: nextValue });
          } catch {
            // ignore serialisation errors
          }
        }

        return nextValue;
      });
    },
    [key]
  );

  // Listen for changes posted by other tabs/apps
  useEffect(() => {
    const ch = getChannel();
    if (!ch) return;

    const handler = (event) => {
      if (event.data?.key === key) {
        setStoredValue(event.data.value);
      }
    };

    ch.addEventListener("message", handler);
    return () => ch.removeEventListener("message", handler);
  }, [key]);

  return [storedValue, setValue];
}
