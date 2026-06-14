import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export function useDocument(collectionName, docId, initialValue) {
  const [data, setData] = useState(initialValue);
  const dataRef = useRef(initialValue);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, collectionName, docId),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          dataRef.current = d;
          setData(d);
        } else {
          // First run — seed with defaults
          setDoc(doc(db, collectionName, docId), initialValue).catch(console.error);
        }
      },
      (err) => console.error(`Firestore doc [${collectionName}/${docId}]:`, err)
    );
    return unsub;
  }, [collectionName, docId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = useCallback(
    (valueOrUpdater) => {
      const current = dataRef.current;
      const next =
        typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater;

      dataRef.current = next;
      setData(next);
      setDoc(doc(db, collectionName, docId), next).catch((e) =>
        console.error(`Firestore write [${collectionName}/${docId}]:`, e)
      );
    },
    [collectionName, docId]
  );

  return [data, setValue];
}
