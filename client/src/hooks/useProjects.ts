import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectService } from '../services/projectService'
import { useProjectStore } from '../store/projectStore'
import type { CreateProjectPayload, UpdateProjectPayload } from '../types/project'

export const useProjects = (params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  const queryClient = useQueryClient()
  const { setProjects, addProject, updateProject, removeProject } = useProjectStore()

  const projectsQuery = useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const data = await projectService.getProjects(params)
      setProjects(data.data, data.total)
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.createProject(payload),
    onSuccess: (project) => {
      addProject(project)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully!')
    },
    onError: () => {
      toast.error('Failed to create project')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
      projectService.updateProject(id, data),
    onSuccess: (project) => {
      updateProject(project.id, project)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update project')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (_, id) => {
      removeProject(id)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => projectService.duplicateProject(id),
    onSuccess: (project) => {
      addProject(project)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project duplicated!')
    },
    onError: () => {
      toast.error('Failed to duplicate project')
    },
  })

  return {
    projects: projectsQuery.data?.data ?? [],
    total: projectsQuery.data?.total ?? 0,
    totalPages: projectsQuery.data?.totalPages ?? 0,
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    refetch: projectsQuery.refetch,
    createProject: createMutation.mutate,
    updateProject: updateMutation.mutate,
    deleteProject: deleteMutation.mutate,
    duplicateProject: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export const useProject = (id: string) => {
  const { setCurrentProject } = useProjectStore()

  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const project = await projectService.getProject(id)
      setCurrentProject(project)
      return project
    },
    enabled: !!id,
  })
}
