import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import ServicesPage from '../Components/ServicesPage';
import ServicesDisplay from '../Components/ServicesDisplay';

function App() {
  const [services, setServices] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // You'll need to implement your auth logic

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div>
        <ServicesPage />
    </div>
  );
}

export default App;