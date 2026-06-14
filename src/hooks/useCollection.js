import { useCallback, useEffect, useRef, useState } from "react";
import { collection, doc, deleteDoc, onSnapshot, query, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export function useCollection(collectionName, initialValue = []) {
  const [data, setData] = useState(initialValue);
  const dataRef = useRef(initialValue);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
        dataRef.current = items;
        setData(items);
      },
      (err) => console.error(`Firestore [${collectionName}]:`, err)
    );
    return unsub;
  }, [collectionName]);

  const setValue = useCallback(
    (valueOrUpdater) => {
      const current = dataRef.current;
      const next =
        typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater;

      // Update local state immediately (optimistic)
      dataRef.current = next;
      setData(next);

      // Sync to Firestore — write added or changed items
      const oldMap = new Map(current.map((i) => [String(i.id), i]));
      const newMap = new Map(next.map((i) => [String(i.id), i]));

      next.forEach((item) => {
        const old = oldMap.get(String(item.id));
        if (!old || JSON.stringify(old) !== JSON.stringify(item)) {
          setDoc(doc(db, collectionName, String(item.id)), item).catch((e) =>
            console.error(`Firestore write [${collectionName}/${item.id}]:`, e)
          );
        }
      });

      // Delete removed items
      current.forEach((item) => {
        if (!newMap.has(String(item.id))) {
          deleteDoc(doc(db, collectionName, String(item.id))).catch(console.error);
        }
      });
    },
    [collectionName]
  );

  return [data, setValue];
}
