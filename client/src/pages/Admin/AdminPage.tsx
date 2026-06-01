// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Grid, Paper, Chip, Stack, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, Tab, Tabs, CircularProgress, Select,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import { AdminPanelSettings, Delete, Edit, VerifiedUser, Block, People, Folder, Star } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import StatsCard from '../../components/ui/StatsCard'

interface AdminStats {
  totalUsers: number
  totalProjects: number
  totalArchitects: number
  totalReviews: number
  activeUsers: number
  newUsersThisMonth: number
  usersByRole: Record<string, number>
  recentActivity: { label: string; count: number }[]
}

export default function AdminPage() {
  const [tab, setTab] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: statsData } = useQuery<{ stats: AdminStats }>({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users?limit=50')).data,
    enabled: tab === 1,
  })

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => (await api.get('/admin/projects?limit=50')).data,
    enabled: tab === 2,
  })

  const { data: architectsData } = useQuery({
    queryKey: ['admin-architects'],
    queryFn: async () => (await api.get('/admin/architects?limit=50')).data,
    enabled: tab === 3,
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.put(`/admin/users/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User updated') },
    onError: () => toast.error('Update failed'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User deleted'); setDeleteConfirm(null) },
    onError: () => toast.error('Delete failed'),
  })

  const verifyArchMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/architects/${id}/verify`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-architects'] }); toast.success('Architect verified') },
    onError: () => toast.error('Verification failed'),
  })

  const stats = statsData?.stats
  const users = usersData?.users || []
  const projects = projectsData?.projects || []
  const architects = architectsData?.architects || []

  const chartData = stats?.recentActivity || [
    { label: 'Jan', count: 12 }, { label: 'Feb', count: 19 }, { label: 'Mar', count: 28 },
    { label: 'Apr', count: 35 }, { label: 'May', count: 42 }, { label: 'Jun', count: 55 },
  ]

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
        Admin Dashboard
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Users" />
        <Tab label="Projects" />
        <Tab label="Architects" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<People />} color="#6C63FF" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Total Projects" value={stats?.totalProjects ?? 0} icon={<Folder />} color="#FF6584" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Architects" value={stats?.totalArchitects ?? 0} icon={<VerifiedUser />} color="#42A5F5" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Reviews" value={stats?.totalReviews ?? 0} icon={<Star />} color="#66BB6A" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Platform Activity</Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Users by Role</Typography>
                {stats?.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                  <Box key={role} display="flex" justifyContent="space-between" alignItems="center" py={0.8}>
                    <Chip label={role} size="small" />
                    <Typography fontWeight={600}>{count as number}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}

      {tab === 1 && (
        <Paper>
          {usersLoading ? <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u: { _id: string; name: string; email: string; avatar?: string; role: string; isActive: boolean; subscription?: { plan: string }; createdAt: string }) => (
                    <TableRow key={u._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar src={u.avatar} sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{u.name[0]}</Avatar>
                          <Box><Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{u.email}</Typography></Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Select size="small" value={u.role}
                          onChange={(e) => updateUserMutation.mutate({ id: u._id, data: { role: e.target.value } })}
                          sx={{ minWidth: 110, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                          {['homeowner', 'architect', 'builder', 'admin'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell><Chip label={u.isActive ? 'Active' : 'Inactive'} size="small" color={u.isActive ? 'success' : 'error'} /></TableCell>
                      <TableCell><Chip label={u.subscription?.plan || 'free'} size="small" /></TableCell>
                      <TableCell><Typography variant="caption">{format(new Date(u.createdAt), 'MMM d, yyyy')}</Typography></TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => updateUserMutation.mutate({ id: u._id, data: { isActive: !u.isActive } })}>
                          {u.isActive ? <Block fontSize="small" /> : <VerifiedUser fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm(u._id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {tab === 2 && (
        <Paper>
          {projectsLoading ? <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Style</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((p: { _id: string; projectName: string; owner?: { name: string }; houseStyle: string; status: string; createdAt: string }) => (
                    <TableRow key={p._id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>{p.projectName}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{p.owner?.name}</Typography></TableCell>
                      <TableCell><Chip label={p.houseStyle} size="small" variant="outlined" /></TableCell>
                      <TableCell><Chip label={p.status} size="small" color={p.status === 'active' ? 'success' : 'default'} /></TableCell>
                      <TableCell><Typography variant="caption">{format(new Date(p.createdAt), 'MMM d, yyyy')}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {tab === 3 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Architect</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {architects.map((a: { _id: string; user?: { name: string; avatar?: string }; experience: number; rating: number; isVerified: boolean }) => (
                  <TableRow key={a._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar src={a.user?.avatar} sx={{ width: 32, height: 32 }}>{a.user?.name?.[0]}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{a.user?.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{a.experience} yrs</Typography></TableCell>
                    <TableCell><Chip label={`★ ${(a.rating || 0).toFixed(1)}`} size="small" color="warning" /></TableCell>
                    <TableCell><Chip label={a.isVerified ? 'Verified' : 'Pending'} size="small" color={a.isVerified ? 'success' : 'warning'} /></TableCell>
                    <TableCell align="right">
                      {!a.isVerified && (
                        <Button size="small" variant="contained" color="success" startIcon={<VerifiedUser />}
                          onClick={() => verifyArchMutation.mutate(a._id)}>Verify</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent><Typography>Are you sure? This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && deleteUserMutation.mutate(deleteConfirm)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
