import { useCallback, useState } from "react";
import { readStorage, writeStorage } from "../services/storageService.js";

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
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
