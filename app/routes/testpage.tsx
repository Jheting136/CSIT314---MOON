import React, { useEffect, useState } from 'react';
import { DataController } from '../controllers/commonController';

export default function Homeowners() {
  const [homeowners, setHomeowners] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await DataController.fetchTableData('homeowners');
      setHomeowners(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Homeowners</h2>
      <ul>
        {homeowners.map((homeowner: any, index: number) => (
          <li key={index}>
            <strong>{homeowner.name}</strong> — {homeowner.email}
          </li>
        ))}
      </ul>
    </div>
  );
}