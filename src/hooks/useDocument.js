import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

// Like useCollection but for a single Firestore document (e.g. app settings).
export function useDocument(collectionName, docId, initialValue) {
  const [data, setData] = useState(initialValue);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, collectionName, docId), (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else {
        setDoc(doc(db, collectionName, docId), initialValue);
      }
    });
    return unsub;
  }, [collectionName, docId]);

  const setValue = useCallback(
    (valueOrUpdater) => {
      setData((current) => {
        const next =
          typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater;
        setDoc(doc(db, collectionName, docId), next);
        return next;
      });
    },
    [collectionName, docId]
  );

  return [data, setValue];
}
