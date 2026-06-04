// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Grid, Paper, Chip, Stack, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, Tab, Tabs, CircularProgress, Select,
  MenuItem, TextField, InputAdornment, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import {
  AdminPanelSettings, Delete, VerifiedUser, Block, People, Folder, Star,
  Search, Visibility, CheckCircle,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import StatsCard from '../../components/ui/StatsCard'
import UserDetailDrawer from './UserDetailDrawer'

const ROLE_COLORS: Record<string, string> = {
  homeowner: '#6C63FF', architect: '#42A5F5', builder: '#FF9800', admin: '#F44336', all: '#888',
}

export default function AdminPage() {
  const [tab, setTab] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  })

  const buildUserParams = () => {
    const params: Record<string, string> = { limit: '100' }
    if (roleFilter !== 'all') params.role = roleFilter
    if (statusFilter !== 'all') params.isActive = statusFilter === 'active' ? 'true' : 'false'
    if (search) params.search = search
    return new URLSearchParams(params).toString()
  }

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, statusFilter, search],
    queryFn: async () => (await api.get(`/admin/users?${buildUserParams()}`)).data,
    enabled: tab === 1,
  })

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => (await api.get('/admin/projects?limit=100')).data,
    enabled: tab === 2,
  })

  const { data: architectsData } = useQuery({
    queryKey: ['admin-architects'],
    queryFn: async () => (await api.get('/admin/architects?limit=50')).data,
    enabled: tab === 3,
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.put(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User updated')
    },
    onError: () => toast.error('Update failed'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deactivated')
    },
    onError: () => toast.error('Delete failed'),
  })

  const verifyArchMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/architects/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-architects'] })
      toast.success('Architect verified')
    },
    onError: () => toast.error('Verification failed'),
  })

  const stats = statsData?.stats
  const users = usersData?.users || []
  const projects = projectsData?.projects || []
  const architects = architectsData?.architects || []

  const monthlyData = (statsData?.charts?.monthlySignups || []).map((m: any) => ({
    label: new Date(m._id.year, m._id.month - 1).toLocaleString('en', { month: 'short' }),
    count: m.count,
  }))

  const fallbackChart = [
    { label: 'Jan', count: 0 }, { label: 'Feb', count: 0 }, { label: 'Mar', count: 0 },
  ]

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AdminPanelSettings sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight={800}>Admin Dashboard</Typography>
          <Typography variant="caption" color="text.secondary">Full platform control & user management</Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['Overview', 'Users', 'Projects', 'Architects'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {/* ─── OVERVIEW ─── */}
      {tab === 0 && (
        <Stack spacing={3}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Total Users" value={stats?.users?.total ?? 0} icon={<People />} color="#6C63FF" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Total Projects" value={stats?.projects?.total ?? 0} icon={<Folder />} color="#FF6584" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Architects" value={stats?.users?.architects ?? 0} icon={<VerifiedUser />} color="#42A5F5" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Reviews" value={stats?.reviews ?? 0} icon={<Star />} color="#66BB6A" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Monthly Signups</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyData.length ? monthlyData : fallbackChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Users" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Users by Role</Typography>
                {[
                  ['Homeowners', stats?.users?.homeowners ?? 0, '#6C63FF'],
                  ['Architects', stats?.users?.architects ?? 0, '#42A5F5'],
                  ['Builders', stats?.users?.builders ?? 0, '#FF9800'],
                ].map(([label, count, color]) => (
                  <Box key={label as string} display="flex" justifyContent="space-between" alignItems="center" py={1.2}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                      <Typography variant="body2">{label as string}</Typography>
                    </Box>
                    <Typography fontWeight={700}>{count as number}</Typography>
                  </Box>
                ))}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Active Projects</Typography>
                  <Typography variant="h5" fontWeight={800}>{stats?.projects?.active ?? 0}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}

      {/* ─── USERS ─── */}
      {tab === 1 && (
        <Stack spacing={2}>
          {/* Filters */}
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <ToggleButtonGroup
                size="small"
                exclusive
                value={roleFilter}
                onChange={(_, v) => v && setRoleFilter(v)}
              >
                {['all', 'homeowner', 'architect', 'builder', 'admin'].map((r) => (
                  <ToggleButton key={r} value={r} sx={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>
                    {r}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={statusFilter}
                onChange={(_, v) => v && setStatusFilter(v)}
              >
                {['all', 'active', 'inactive'].map((s) => (
                  <ToggleButton key={s} value={s} sx={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>{s}</ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {users.length} result{users.length !== 1 ? 's' : ''}
              </Typography>
            </Stack>
          </Paper>

          <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            {usersLoading ? (
              <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ '& th': { fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', color: 'text.secondary' } }}>
                    <TableRow>
                      <TableCell>USER</TableCell>
                      <TableCell>ROLE</TableCell>
                      <TableCell>STATUS</TableCell>
                      <TableCell>PLAN</TableCell>
                      <TableCell>JOINED</TableCell>
                      <TableCell>LAST LOGIN</TableCell>
                      <TableCell align="right">ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u: any) => (
                      <TableRow key={u._id} hover sx={{ cursor: 'pointer' }}>
                        <TableCell onClick={() => setSelectedUserId(u._id)}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar src={u.avatar} sx={{ width: 36, height: 36, bgcolor: ROLE_COLORS[u.role] }}>
                              {u.name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{u.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={u.role}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateUserMutation.mutate({ id: u._id, data: { role: e.target.value } })}
                            sx={{ minWidth: 110, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                          >
                            {['homeowner', 'architect', 'builder', 'admin'].map((r) => (
                              <MenuItem key={r} value={r}>{r}</MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={u.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={u.subscription?.plan || 'free'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{format(new Date(u.createdAt), 'MMM d, yyyy')}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d') : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <IconButton size="small" onClick={() => setSelectedUserId(u._id)} title="View details">
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                            onClick={() => updateUserMutation.mutate({ id: u._id, data: { isActive: !u.isActive } })}
                          >
                            {u.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" color="success" />}
                          </IconButton>
                          <IconButton size="small" color="error" title="Delete"
                            onClick={() => deleteUserMutation.mutate(u._id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          No users match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Stack>
      )}

      {/* ─── PROJECTS ─── */}
      {tab === 2 && (
        <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {projectsLoading ? (
            <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ '& th': { fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', color: 'text.secondary' } }}>
                  <TableRow>
                    <TableCell>PROJECT</TableCell>
                    <TableCell>OWNER</TableCell>
                    <TableCell>STYLE</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>PLOT</TableCell>
                    <TableCell>LOCATION</TableCell>
                    <TableCell>CREATED</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((p: any) => (
                    <TableRow key={p._id} hover>
                      <TableCell><Typography variant="body2" fontWeight={700}>{p.projectName}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={p.owner?.avatar} sx={{ width: 24, height: 24, fontSize: 12 }}>{p.owner?.name?.[0]}</Avatar>
                          <Typography variant="caption">{p.owner?.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={p.houseStyle} size="small" variant="outlined" /></TableCell>
                      <TableCell>
                        <Chip label={p.status} size="small" color={p.status === 'active' ? 'success' : p.status === 'completed' ? 'primary' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{p.plotArea ? `${p.plotArea} m²` : '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{p.location || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{format(new Date(p.createdAt), 'MMM d, yyyy')}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* ─── ARCHITECTS ─── */}
      {tab === 3 && (
        <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ '& th': { fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', color: 'text.secondary' } }}>
                <TableRow>
                  <TableCell>ARCHITECT</TableCell>
                  <TableCell>EMAIL</TableCell>
                  <TableCell>EXPERIENCE</TableCell>
                  <TableCell>RATING</TableCell>
                  <TableCell>VERIFIED</TableCell>
                  <TableCell align="right">ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {architects.map((a: any) => (
                  <TableRow key={a._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar src={a.user?.avatar} sx={{ width: 36, height: 36 }}>{a.user?.name?.[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{a.user?.name}</Typography>
                          <Chip label={a.isVerified ? 'Verified' : 'Pending'} size="small"
                            color={a.isVerified ? 'success' : 'warning'} sx={{ mt: 0.3 }} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="caption">{a.user?.email}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{a.experience} yrs</Typography></TableCell>
                    <TableCell>
                      <Chip label={`★ ${(a.rating || 0).toFixed(1)}`} size="small" color="warning" />
                    </TableCell>
                    <TableCell>
                      <Chip label={a.isVerified ? 'Verified' : 'Pending'} size="small"
                        color={a.isVerified ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell align="right">
                      {!a.isVerified && (
                        <Button size="small" variant="contained" color="success" startIcon={<VerifiedUser />}
                          onClick={() => verifyArchMutation.mutate(a._id)}>
                          Verify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* User Detail Drawer */}
      <UserDetailDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </Box>
  )
}
