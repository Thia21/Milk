import { useCallback, useEffect, useState } from "react";
import { collection, doc, deleteDoc, onSnapshot, query, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

// Drop-in replacement for useLocalStorage that syncs with Firestore in real-time.
// Accepts the same [value, setValue] API — setValue works with both direct values
// and updater functions: setValue(prev => [...prev, newItem]).
export function useCollection(collectionName, initialValue = []) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      setData(items);
      setLoading(false);
    });
    return unsub;
  }, [collectionName]);

  const setValue = useCallback(
    (valueOrUpdater) => {
      setData((current) => {
        const next =
          typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater;

        const oldMap = new Map(current.map((i) => [String(i.id), i]));
        const newMap = new Map(next.map((i) => [String(i.id), i]));

        // Write added or changed items
        next.forEach((item) => {
          const old = oldMap.get(String(item.id));
          if (!old || JSON.stringify(old) !== JSON.stringify(item)) {
            setDoc(doc(db, collectionName, String(item.id)), item);
          }
        });

        // Delete removed items
        current.forEach((item) => {
          if (!newMap.has(String(item.id))) {
            deleteDoc(doc(db, collectionName, String(item.id)));
          }
        });

        return next;
      });
    },
    [collectionName]
  );

  return [data, setValue, loading];
}
