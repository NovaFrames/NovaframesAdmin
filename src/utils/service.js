import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function fetchServices() {
  const servicesCollectionRef = collection(db, "services");
  const querySnapshot = await getDocs(servicesCollectionRef);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}