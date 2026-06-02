'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardShell } from '../../components/DashboardShell';
import { EntityForm } from '../../components/EntityForm';
import { ENTITY_MAP } from '../../lib/entities';
import { api } from '../../lib/api';

type Row = Record<string, unknown>;

export default function EntityPage() {
  const params = useParams<{ entity: string }>();
  const def = ENTITY_MAP[params.entity];

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Row | null | undefined>(undefined); // undefined = закрыто

  const reload = useCallback(() => {
    if (!def) return;
    setLoading(true);
    api
      .get<Row[]>(def.endpoint)
      .then(setRows)
      .catch((e) => setError(e.message ?? 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [def]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (!def) {
    return (
      <DashboardShell>
        <Alert severity="warning">Неизвестный раздел: {params.entity}</Alert>
      </DashboardShell>
    );
  }

  async function onDelete(id: unknown) {
    if (!def || !confirm('Удалить запись?')) return;
    try {
      await api.del(`${def.endpoint}/${id}`);
      reload();
    } catch (e) {
      setError((e as Error).message ?? 'Не удалось удалить');
    }
  }

  const columns: GridColDef[] = [
    ...def.columns.map((c) => ({
      field: c.field,
      headerName: c.header,
      width: c.width ?? 160,
      sortable: false,
      valueGetter: (_v: unknown, row: Row) => c.value(row),
    })),
    {
      field: '__actions',
      headerName: '',
      width: 110,
      sortable: false,
      renderCell: (p) => (
        <>
          <IconButton size="small" onClick={() => setEditing(p.row as Row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete((p.row as Row).id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <DashboardShell>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">{def.title}</Typography>
        <Button variant="contained" onClick={() => setEditing(null)}>
          Создать
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Box sx={{ height: 'calc(100vh - 200px)', bgcolor: 'background.paper' }}>
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => (r as Row).id as number}
            disableRowSelectionOnClick
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
          />
        )}
      </Box>
      {editing !== undefined && (
        <EntityForm
          entity={def}
          row={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      )}
    </DashboardShell>
  );
}
