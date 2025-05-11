import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { commonController } from '../controllers/commonController';
import { adminViewController } from '../controllers/adminViewController';
import {
  TextField, Button, List, ListItem, Typography, Container, Box,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

export default function Homeowners() {
  const [homeowners, setHomeowners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  // Approval dialog state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [userIdToApprove, setUserIdToApprove] = useState(null);

  // Load users with optional search
  const loadData = async () => {
    const filters = [];

    if (searchTerm) {
      filters.push({ column: 'name', operator: 'ilike', value: `%${searchTerm}%` });
      filters.push({ column: 'email', operator: 'ilike', value: `%${searchTerm}%` });
    }

    const result = await commonController.fetchTableData(
      'users',
      'id, name, email, account_type, created_at, status',
      filters,
      page,
      pageSize
    );

    setHomeowners(result.data || []);
    setTotalPages(Math.ceil(result.count / pageSize));
  };

  useEffect(() => {
    loadData();
  }, [page, searchTerm]);

  // Search box handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // --- Delete Dialog Functions ---
  const openDeleteDialog = (id) => {
    setUserIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setUserIdToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteUser = async () => {
    await adminViewController.deleteUser(userIdToDelete);
    closeDeleteDialog();
    loadData();
  };

  // --- Approval Dialog Functions ---
  const openApprovalDialog = (id) => {
    setUserIdToApprove(id);
    setApprovalDialogOpen(true);
  };

  const closeApprovalDialog = () => {
    setUserIdToApprove(null);
    setApprovalDialogOpen(false);
  };

  const handleApproveUser = async () => {
    await adminViewController.approveUser(userIdToApprove);
    closeApprovalDialog();
    loadData();
  };

  const handleRejectUser = async () => {
    await adminViewController.rejectUser(userIdToApprove);
    closeApprovalDialog();
    loadData();
  };

  return (
    <Box className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <Box className="container mx-auto px-4 py-12">
        <Box
          className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white"
          sx={{
            position: 'sticky',
            top: 0, // Important for sticky to work
            zIndex: 1000,
            paddingTop: 2,
            paddingBottom: 2,
            mb: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Users (Page {page} of {totalPages})
          </Typography>

          <TextField
            type="text"
            placeholder="Search by name or email"
            sx={{
                  backgroundColor: 'white',
                  borderRadius: 1,
                  input: { color: 'black' },
                }}
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            fullWidth
          />
        </Box>

        <List sx={{ borderRadius: '6px', border: '1px solid #444' }}>
          {homeowners.length > 0 ? (
            homeowners.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  padding: '1rem',
                  borderBottom: '1px solid #444',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#1e1e1e' }
                }}
                onClick={() => navigate(`/viewUserProfile/${item.id}`)}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>{item.email}</Typography>
                  <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic' }}>
                    {item.account_type} | {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                  {item.account_type === 'cleaner' && item.status === 'pending' && (
                    <IconButton color="warning" onClick={() => openApprovalDialog(item.id)}>
                      <PendingActionsIcon />
                    </IconButton>
                  )}
                  <IconButton color="error" onClick={() => openDeleteDialog(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <Typography color="gray">No data found</Typography>
            </ListItem>
          )}
        </List>

        {/* Pagination */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="outlined" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outlined" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>Are you sure you want to delete this user?</DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button color="error" onClick={handleDeleteUser}>Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onClose={closeApprovalDialog}>
          <DialogTitle>Review Pending User</DialogTitle>
          <DialogContent>
            Approve or reject this cleaner registration?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRejectUser} color="error">Reject</Button>
            <Button onClick={handleApproveUser} color="primary">Approve</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}