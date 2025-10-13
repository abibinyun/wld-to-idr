import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export const getUserTransactions = async (uid: string) => {
  const q = query(collection(db, "transactions"), where("user_id", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const createTransaction = async (uid: string, data: any) => {
  return await addDoc(collection(db, "transactions"), {
    user_id: uid,
    created_at: serverTimestamp(),
    ...data,
  });
};

export const listenTransactions = (uid: string, cb: Function) => {
  const q = query(collection(db, "transactions"), where("user_id", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    cb(list);
  });
};

export const updateTransaction = async (id: string, data: any) => {
  const ref = doc(db, "transactions", id);
  await updateDoc(ref, data);
};
