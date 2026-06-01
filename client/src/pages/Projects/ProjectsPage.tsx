// @ts-nocheck
import { useState } from 'react'
import {
  Box, Grid, Typography, Button, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, ToggleButton,
  ToggleButtonGroup, Skeleton, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import GridViewIcon from '@mui/icons-material/GridView'
import ListIcon from '@mui/icons-material/List'
import FolderIcon from '@mui/icons-material/Folder'
import ProjectCard from '../../components/ui/ProjectCard'
import EmptyState from '../../components/ui/EmptyState'
import { useProjects } from '../../hooks/useProjects'
import type { Project } from '../../types/project'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { projects, isLoading, deleteProject, duplicateProject, isDeleting } = useProjects({
    search: search || undefined,
    status: statusFilter || undefined,
  })

  const handleDelete = () => {
    if (deleteId) {
      deleteProject(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Projects
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
            Manage and track all your architecture projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/create')}
          sx={{
            background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
            '&:hover': { background: 'linear-gradient(135deg, #5750D9, #7A73EE)' },
          }}
        >
          New Project
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="planning">Planning</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="review">Review</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ ml: 'auto' }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
          >
            <ToggleButton value="grid" sx={{ px: 1.5 }}>
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" sx={{ px: 1.5 }}>
              <ListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Content */}
      {isLoading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderIcon />}
          title="No projects yet"
          description="Create your first project to start designing your dream home with AI-powered tools."
          action={{ label: 'Create First Project', onClick: () => navigate('/projects/create') }}
        />
      ) : (
        <Grid container spacing={2.5}>
          {projects.map((project: Project) => (
            <Grid item xs={12} sm={view === 'grid' ? 6 : 12} lg={view === 'grid' ? 4 : 12} key={project.id ?? project._id}>
              <ProjectCard
                project={project}
                onEdit={(p) => navigate(`/projects/${p.id ?? p._id}`)}
                onDelete={(id) => setDeleteId(id)}
                onDuplicate={(id) => duplicateProject(id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { width: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This action cannot be undone. The project and all its data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
