// @ts-nocheck
import { useState } from 'react'
import {
  Drawer, Box, Typography, Avatar, Chip, Stack, IconButton, Divider,
  Grid, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress,
  Alert, Tooltip, Paper, Badge,
} from '@mui/material'
import {
  Close, Email, Phone, LocationOn, CalendarToday, Login, VerifiedUser,
  Google, Notifications, Folder, AdminPanelSettings, Block, Delete,
  CheckCircle, Cancel, CreditCard,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const ROLES = ['homeowner', 'architect', 'builder', 'admin']
const PLANS = ['free', 'pro', 'enterprise']

const roleColor: Record<string, string> = {
  homeowner: '#6C63FF', architect: '#42A5F5', builder: '#FF9800', admin: '#F44336',
}
const planColor: Record<string, 'default' | 'primary' | 'warning'> = {
  free: 'default', pro: 'primary', enterprise: 'warning',
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 110 }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'right', maxWidth: 220, wordBreak: 'break-all' }}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

interface Props {
  userId: string | null
  onClose: () => void
}

export default function UserDetailDrawer({ userId, onClose }: Props) {
  const queryClient = useQueryClient()
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => (await api.get(`/admin/users/${userId}`)).data,
    enabled: !!userId,
  })

  const updateMut = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put(`/admin/users/${userId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User updated')
    },
    onError: () => toast.error('Update failed'),
  })

  const deleteMut = useMutation({
    mutationFn: () => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deactivated')
      onClose()
    },
    onError: () => toast.error('Delete failed'),
  })

  const user = data?.user
  const projects = data?.projects ?? []
  const projectCount = data?.projectCount ?? 0

  return (
    <Drawer
      anchor="right"
      open={!!userId}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3, overflowY: 'auto' } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>User Detail</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">Failed to load user details.</Alert>}

      {user && (
        <>
          {/* Identity */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: 'rgba(108,99,255,0.04)' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                user.isActive
                  ? <CheckCircle sx={{ fontSize: 16, color: '#66BB6A' }} />
                  : <Cancel sx={{ fontSize: 16, color: '#F44336' }} />
              }
            >
              <Avatar src={user.avatar} sx={{ width: 72, height: 72, fontSize: 28, bgcolor: roleColor[user.role] }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
            </Badge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{user.email}</Typography>
              <Stack direction="row" gap={0.7} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip label={user.role} size="small" sx={{ bgcolor: roleColor[user.role] + '22', color: roleColor[user.role], fontWeight: 700, fontSize: '0.68rem' }} />
                <Chip label={user.subscription?.plan || 'free'} size="small" color={planColor[user.subscription?.plan] || 'default'} />
                {user.isEmailVerified && <Chip icon={<VerifiedUser sx={{ fontSize: 12 }} />} label="Verified" size="small" color="success" />}
                {user.googleId && <Chip icon={<Google sx={{ fontSize: 12 }} />} label="Google" size="small" variant="outlined" />}
                {!user.isActive && <Chip label="Inactive" size="small" color="error" />}
              </Stack>
            </Box>
          </Box>

          {/* Contact */}
          <Section title="Contact & Location" icon={<LocationOn fontSize="small" />}>
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Street" value={user.address?.street} />
            <InfoRow label="City" value={user.address?.city} />
            <InfoRow label="State" value={user.address?.state} />
            <InfoRow label="Country" value={user.address?.country} />
            <InfoRow label="Pincode" value={user.address?.pincode} />
          </Section>

          <Divider sx={{ my: 2 }} />

          {/* Account */}
          <Section title="Account Info" icon={<CalendarToday fontSize="small" />}>
            <InfoRow label="User ID" value={user._id} />
            <InfoRow label="Joined" value={user.createdAt ? format(new Date(user.createdAt), 'PPP') : undefined} />
            <InfoRow label="Last Login" value={user.lastLogin ? format(new Date(user.lastLogin), 'PPP p') : 'Never'} />
            <InfoRow label="Email Verified" value={user.isEmailVerified ? 'Yes' : 'No'} />
            <InfoRow label="Account Status" value={user.isActive ? 'Active' : 'Deactivated'} />
            <InfoRow label="Google OAuth" value={user.googleId ? 'Linked' : 'Not linked'} />
            {user.bio && <InfoRow label="Bio" value={user.bio} />}
          </Section>

          <Divider sx={{ my: 2 }} />

          {/* Subscription */}
          <Section title="Subscription" icon={<CreditCard fontSize="small" />}>
            <InfoRow label="Plan" value={user.subscription?.plan || 'free'} />
            <InfoRow label="Expires" value={user.subscription?.expiresAt ? format(new Date(user.subscription.expiresAt), 'PPP') : 'Never'} />
          </Section>

          <Divider sx={{ my: 2 }} />

          {/* Recent Notifications */}
          {user.notifications?.length > 0 && (
            <>
              <Section title={`Notifications (${user.notifications.length})`} icon={<Notifications fontSize="small" />}>
                <Stack spacing={1}>
                  {user.notifications.slice(0, 5).map((n: any, i: number) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 2, opacity: n.read ? 0.6 : 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, flex: 1, mr: 1 }}>{n.message}</Typography>
                        {!n.read && <Chip label="New" size="small" color="primary" sx={{ fontSize: '0.6rem', height: 16 }} />}
                      </Box>
                      <Typography variant="caption" color="text.disabled">
                        {n.createdAt ? format(new Date(n.createdAt), 'MMM d, yyyy') : ''}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Section>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Projects */}
          <Section title={`Projects (${projectCount})`} icon={<Folder fontSize="small" />}>
            {projects.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No projects yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {projects.map((p: any) => (
                  <Paper key={p._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.projectName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.houseStyle} · {p.location || 'No location'} · {p.plotArea ? `${p.plotArea} m²` : '—'}
                        </Typography>
                      </Box>
                      <Chip label={p.status} size="small" color={p.status === 'active' ? 'success' : 'default'} />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Section>

          <Divider sx={{ my: 2 }} />

          {/* Admin Actions */}
          <Section title="Admin Actions" icon={<AdminPanelSettings fontSize="small" />}>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    value={user.role}
                    onChange={(e) => updateMut.mutate({ role: e.target.value })}
                  >
                    {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Plan</InputLabel>
                  <Select
                    label="Plan"
                    value={user.subscription?.plan || 'free'}
                    onChange={(e) => updateMut.mutate({ subscriptionPlan: e.target.value })}
                  >
                    {PLANS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color={user.isActive ? 'error' : 'success'}
                  startIcon={user.isActive ? <Block /> : <CheckCircle />}
                  onClick={() => updateMut.mutate({ isActive: !user.isActive })}
                  disabled={updateMut.isPending}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color={user.isEmailVerified ? 'warning' : 'success'}
                  startIcon={<Email />}
                  onClick={() => updateMut.mutate({ isEmailVerified: !user.isEmailVerified })}
                  disabled={updateMut.isPending}
                >
                  {user.isEmailVerified ? 'Unverify Email' : 'Verify Email'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                {!deleteConfirm ? (
                  <Button fullWidth variant="outlined" color="error" startIcon={<Delete />}
                    onClick={() => setDeleteConfirm(true)}>
                    Deactivate Account
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="contained" color="error" onClick={() => deleteMut.mutate()}
                      disabled={deleteMut.isPending}>
                      Confirm Deactivate
                    </Button>
                    <Button fullWidth variant="outlined" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
                  </Stack>
                )}
              </Grid>
            </Grid>
          </Section>
        </>
      )}
    </Drawer>
  )
}
