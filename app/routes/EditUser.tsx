import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { AdminEditController } from '../controllers/adminEditController';
import {
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';

export default function EditUser() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [vals, setVals] = useState({ name: '', account_type: 'homeowner' });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  /* fetch current info */
  useEffect(() => {
    (async () => {
      try {
        const u = await AdminEditController.getUser(id!);
        setVals({ name: u.name, account_type: u.account_type });
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    try {
      await AdminEditController.saveUser(id!, vals);
      nav(-1);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;

  return (
    <Paper sx={{ p: 4, maxWidth: 480, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" mb={3}>
        Edit User
      </Typography>

      <TextField
        fullWidth
        label="Name"
        sx={{ mb: 3 }}
        value={vals.name}
        onChange={(e) => setVals({ ...vals, name: e.target.value })}
      />

      <TextField
        select
        fullWidth
        label="Account type"
        sx={{ mb: 3 }}
        value={vals.account_type}
        onChange={(e) => setVals({ ...vals, account_type: e.target.value })}
      >
        {['homeowner', 'cleaner', 'admin'].map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>

      {err && (
        <Typography color="error" sx={{ mb: 2 }}>
          {err}
        </Typography>
      )}

      <Button variant="contained" onClick={save}>
        Save
      </Button>{' '}
      <Button onClick={() => nav(-1)}>Cancel</Button>
    </Paper>
  );
}
