import { useEffect, useState } from 'react';
import { commonController } from '../controllers/commonController';

export default function Homeowners() {
  const [homeowners, setHomeowners] = useState([]);
  const [page, setPage] = useState(1);  // current page
  const [pageSize, setPageSize] = useState(1); // items per page
  const [totalPages, setTotalPages] = useState(0); // total number of pages

  const loadData = async () => {
      const filters = [{ column: 'account_type', operator: 'eq', value: 'homeowner' }];
      const result = await commonController.fetchTableData('users', 'name, email', filters, page, pageSize);

      setHomeowners(result.data || []);
      setTotalPages(result.count / pageSize);

    };

  useEffect(() => {
    loadData();
  }, [page]);

  return (
    <div>
      <h1>Homeowners (Page {page} of {totalPages})</h1>

      <ul>
        {homeowners.length > 0 ? (
          homeowners.map((item, index) => (
            <li key={index}>{item.name} {item.email}</li>
          ))
        ) : (
          <li>No data found</li>
        )}
      </ul>

      <div style={{ marginTop: '1rem' }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}