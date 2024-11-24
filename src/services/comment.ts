import { CreateCommentDto, EditCommentDto } from '@/common/types/report'
import apiClient from './api'
import { API_URL } from '@/common/constant'

export const addComment = async (
  projectId: number,
  reportId: number,
  createCommentDto: CreateCommentDto,
) => {
  const res = await apiClient.post(
    API_URL + `/projects/${projectId}/reports/${reportId}/report-comments/me`,
    createCommentDto,
  )
  return res.data
}

export const updateComment = async (
  projectId: number,
  reportId: number,
  commentId: number,
  editComment: EditCommentDto,
) => {
  const res = await apiClient.patch(
    API_URL +
      `/projects/${projectId}/reports/${reportId}/report-comments/me/${commentId}`,
    editComment,
  )
  return res.data
}
