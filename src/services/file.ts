import { API_URL } from '@/common/constant'
import apiClient from './api'

export const getPresignedUrl = async (name: string, userId: number) => {
  const res = await apiClient.get(API_URL + '/files/presigned-url', {
    params: {
      fileName: `bug-report/${userId}/${name}`,
    },
  })
  return res.data
}
