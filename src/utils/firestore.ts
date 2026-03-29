import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Client } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const CLIENTS_COLLECTION = 'clients';

export const clientsRef = collection(db, CLIENTS_COLLECTION);

export const getClients = async () => {
  const snapshot = await getDocs(query(clientsRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const getClient = async (id: string) => {
  const docRef = doc(db, CLIENTS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Client;
  }
  return null;
};

export const createClient = async (clientData: Partial<Client>) => {
  const docRef = await addDoc(clientsRef, {
    ...clientData,
    createdAt: Timestamp.now(),
    status: 'pending',
    currentStep: 0
  });
  return docRef.id;
};

export const updateClient = async (id: string, data: Partial<Client>) => {
  const docRef = doc(db, CLIENTS_COLLECTION, id);
  await updateDoc(docRef, data);
};

export const deleteClient = async (id: string) => {
  const docRef = doc(db, CLIENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

export const subscribeToClients = (callback: (clients: Client[]) => void) => {
  return onSnapshot(query(clientsRef, orderBy('createdAt', 'desc')), (snapshot) => {
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    callback(clients);
  });
};
