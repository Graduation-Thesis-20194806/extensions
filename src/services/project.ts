import { API_URL } from '@/common/constant'
import apiClient from './api'
import { ProjectListResponse } from '@/common/types/project'

export const getMyProjects = async (
  page: number,
): Promise<ProjectListResponse> => {
  const res = await apiClient.get(API_URL + '/projects/me', {
    params: {
      page,
    },
  })
  return res.data
}
