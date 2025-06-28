import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function fetchServices() {
  const servicesCollectionRef = collection(db, "services");
  const querySnapshot = await getDocs(servicesCollectionRef);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function fetchContacts() {
  try {
    const contactCollectionRef = collection(db, 'contact');
    const querySnapshot = await getDocs(contactCollectionRef);

    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return messages;
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }
}

export async function markAsDiscussed(contactId) {
  try {
    const contactRef = doc(db, "contact", contactId);
    await updateDoc(contactRef, {
      discussed: true,
    });
    console.log("Marked as discussed");
  } catch (error) {
    console.error("Error updating document:", error);
  }
}