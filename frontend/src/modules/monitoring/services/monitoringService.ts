// src/modules/monitoring/services/monitoringService.ts
import axios from 'axios';

export const getActiveFleet = async () => {
    
  const token = localStorage.getItem('token'); 

  try {
    const response = await axios.get('http://localhost:3000/monitoring/active-fleet', {
      headers: {
        Authorization: `Bearer ${token}` 
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener la flota activa:", error);
    throw error;
  }
};