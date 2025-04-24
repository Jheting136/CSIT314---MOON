import { useEffect, useState } from 'react';
import { DataController } from '../controllers/commonController';

export default function Homeowners() {
  const [homeowners, setHomeowners] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 1;

  const totalPages = Math.ceil(totalCount / pageSize);

  const loadData = async () => {
      const filters = [{ column: 'account_type', operator: 'eq', value: 'homeowner' }];
      const result = await DataController.fetchTableData('users', '*', filters, page, pageSize);

      setHomeowners(result.data);
      setTotalPages(Math.ceil(result.count / pageSize));
    };

  useEffect(() => {
    loadData();
  }, [page]);

  return (
    <div>
      <h1>Homeowners (Page {page} of {totalPages})</h1>

      <ul>
        {homeowners.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>

      <div style={{ marginTop: '1rem' }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}