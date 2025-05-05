import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { commonController } from '../controllers/commonController';
import { adminViewController } from '../controllers/adminViewController';
import { TextField, Button, List, ListItem, Typography, Container, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function Homeowners() {
  const [homeowners, setHomeowners] = useState([]);
  const navigate = useNavigate();

  //delete dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const handleOpenDialog = (id) => {
    setSelectedUserId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedUserId(null);
    setOpenDialog(false);
  };

  //pagination
  const [page, setPage] = useState(1); // current page
  const [pageSize, setPageSize] = useState(10); // items per page
  const [totalPages, setTotalPages] = useState(0); // total number of pages
  const [searchTerm, setSearchTerm] = useState(''); // search term

  // Dynamically fetch data with the search term
  const loadData = async () => {
    const filters = [];

    // If there's a search term, add it to the filters for dynamic searching
    if (searchTerm) {
      filters.push({ column: 'name', operator: 'ilike', value: `%${searchTerm}%` });
      filters.push({ column: 'email', operator: 'ilike', value: `%${searchTerm}%` });
    }

    const result = await commonController.fetchTableData(
      'users',
      'id, name, email, account_type, created_at',
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

    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h5" gutterBottom>
          Users (Page {page} of {totalPages})
        </Typography>
  
        {/* Search Box */}
        <TextField
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          fullWidth
          sx={{ marginBottom: '1.5rem' }}
        />
  
        <List sx={{ backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
          {homeowners.length > 0 ? (
            homeowners.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  padding: '1rem',
                  borderBottom: '1px solid #ccc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#eef' }
                }}
                onClick={() => navigate(`/viewUserProfile/${item.id}`)}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                <Typography variant="body2">{item.email}</Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontStyle: 'italic', mt: 0.5 }}
                >
                  {item.account_type} | {new Date(item.created_at).toLocaleDateString()}
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editUser/${item.id}`);
                    }}
                  >
                Edit
              </Button>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(item.id);
                    }}
                    sx={{ marginRight: 2 }}
                  >
                    Delete
                  </Button>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <Typography>No data found</Typography>
            </ListItem>
          )}
        </List>
  
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="outlined" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="outlined"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this user?
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                color="error"
                onClick={async () => {
                  await adminViewController.deleteUser(selectedUserId);
                  handleCloseDialog();
                  loadData(); // refresh the list
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

    </Container>
  );
}