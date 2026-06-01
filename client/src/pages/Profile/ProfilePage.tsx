import { useState, useRef } from 'react'
import {
  Box, Typography, Paper, Grid, TextField, Button, Avatar,
  Chip, Stack, Divider, CircularProgress, IconButton, MenuItem,
  InputAdornment, Alert,
} from '@mui/material'
import { Person, Edit, CameraAlt, Phone, LocationOn, Info, Save } from '@mui/icons-material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'

const ROLES = { homeowner: 'Homeowner', architect: 'Architect', builder: 'Builder', admin: 'Admin' }

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: {
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || 'India',
      pincode: user?.address?.pincode || '',
    },
  })

  const profileMutation = useMutation({
    mutationFn: async () => (await api.put('/users/profile', form)).data.user,
    onSuccess: (data) => {
      updateUser(data)
      setEditing(false)
      toast.success('Profile updated!')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('avatar', file)
      return (await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data
    },
    onSuccess: (data) => {
      updateUser({ avatar: data.avatar })
      toast.success('Avatar updated!')
    },
    onError: () => toast.error('Failed to upload avatar'),
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) avatarMutation.mutate(file)
  }

  if (!user) return null

  const planColors = { free: 'default', pro: 'primary', enterprise: 'secondary' } as const

  return (
    <Box maxWidth={900} mx="auto">
      <Typography variant="h4" fontWeight={700} gutterBottom>
        <Person sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar src={user.avatar ?? undefined} sx={{ width: 100, height: 100, fontSize: 36, bgcolor: 'primary.main', mx: 'auto' }}>
                {user.name[0]}
              </Avatar>
              <IconButton size="small" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                onClick={() => fileRef.current?.click()} disabled={avatarMutation.isPending}>
                {avatarMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <CameraAlt sx={{ fontSize: 16 }} />}
              </IconButton>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </Box>

            <Typography variant="h6" fontWeight={700}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>{user.email}</Typography>

            <Stack direction="row" spacing={1} justifyContent="center" mb={2} flexWrap="wrap">
              <Chip label={ROLES[user.role as keyof typeof ROLES] || user.role} size="small" color="primary" />
              <Chip label={user.subscription?.plan || 'free'} size="small" color={planColors[user.subscription?.plan as keyof typeof planColors] || 'default'} />
              {user.isEmailVerified && <Chip label="Verified" size="small" color="success" />}
            </Stack>

            {user.bio && <Typography variant="body2" color="text.secondary">{user.bio}</Typography>}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>SUBSCRIPTION</Typography>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="h6" fontWeight={700} color="primary" textTransform="capitalize">
                {user.subscription?.plan || 'Free'} Plan
              </Typography>
              <Button size="small" variant="outlined" sx={{ mt: 1 }} fullWidth>Upgrade Plan</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>Personal Information</Typography>
              {!editing ? (
                <Button startIcon={<Edit />} onClick={() => setEditing(true)} size="small">Edit</Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button size="small" variant="contained" startIcon={profileMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <Save />}
                    onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending}>Save</Button>
                </Stack>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!editing}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={!editing}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" multiline rows={2} label="Bio" value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  disabled={!editing} placeholder="Tell us about yourself..."
                  InputProps={{ startAdornment: <InputAdornment position="start"><Info sx={{ fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12}>
                <Divider><Typography variant="caption" color="text.secondary">ADDRESS</Typography></Divider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="City" value={form.address.city}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                  disabled={!editing}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="State" value={form.address.state}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                  disabled={!editing} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Country" value={form.address.country}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                  disabled={!editing} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Pincode" value={form.address.pincode}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
                  disabled={!editing} />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Account Security</Typography>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" fontWeight={600}>Email Address</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
                <Chip label={user.isEmailVerified ? 'Verified' : 'Not Verified'} size="small" color={user.isEmailVerified ? 'success' : 'warning'} />
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" fontWeight={600}>Password</Typography>
                  <Typography variant="body2" color="text.secondary">Last changed: never</Typography>
                </Box>
                <Button size="small" variant="outlined">Change Password</Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
