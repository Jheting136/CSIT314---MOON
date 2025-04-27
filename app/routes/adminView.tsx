import { useEffect, useState } from 'react';
import { commonController } from '../controllers/commonController';
import { TextField, Button, List, ListItem, Typography, Container, Box } from '@mui/material';

export default function Homeowners() {
  const [homeowners, setHomeowners] = useState([]);
  const [page, setPage] = useState(1); // current page
  const [pageSize, setPageSize] = useState(10); // items per page
  const [totalPages, setTotalPages] = useState(0); // total number of pages
  const [searchTerm, setSearchTerm] = useState(''); // search term

  // Dynamically fetch data with the search term
  const loadData = async () => {
//     const filters = [
//       { column: 'account_type', operator: 'eq', value: 'homeowner' },
//     ];
    const filters = [];

    // If there's a search term, add it to the filters for dynamic searching
    if (searchTerm) {
      filters.push({ column: 'name', operator: 'ilike', value: `%${searchTerm}%` });
      filters.push({ column: 'email', operator: 'ilike', value: `%${searchTerm}%` });
    }

    const result = await commonController.fetchTableData(
      'users',
      'name, email, account_type, created_at',
      filters,
      page,
      pageSize
    );

    setHomeowners(result.data || []);
    setTotalPages(Math.ceil(result.count / pageSize)); // Round up for total pages
  };

  // Trigger loadData when the page or searchTerm changes
  useEffect(() => {
    loadData();
  }, [page, searchTerm]);

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  return (
    <div>
      <h1>Homeowners (Page {page} of {totalPages})</h1>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '1rem' }}
      />

      <List>
              {homeowners.length > 0 ? (
                homeowners.map((item, index) => (
                  <ListItem key={index} sx={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body1">{item.email}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item.account_type} | {new Date(item.created_at).toLocaleDateString()}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <Typography>No data found</Typography>
                </ListItem>
              )}
            </List>

      <div style={{ marginTop: '1rem' }}>
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}