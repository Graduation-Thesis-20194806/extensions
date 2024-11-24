import { API_URL } from '@/common/constant'
import apiClient from './api'
import {
  CreateReportDto,
  Report,
  ReportListResponse,
} from '@/common/types/report'

export const getMyReports = async (
  projectId: number,
  role: 'assigned' | 'owner',
  page: number,
): Promise<ReportListResponse> => {
  const res = await apiClient.get(
    API_URL + `/projects/${projectId}/reports/me`,
    {
      params: {
        role,
        page,
      },
    },
  )
  return res.data
}

export const getMyReport = async (
  projectId: number,
  reportId: number,
): Promise<Report | undefined> => {
  const res = await apiClient.get(
    API_URL + `/projects/${projectId}/reports/me/${reportId}`,
  )
  return res.data
}

export const createReport = async (
  projectId: number,
  reportData: CreateReportDto,
) => {
  const res = await apiClient.post(
    API_URL + `/projects/${projectId}/reports/me/`,
    reportData,
  )
  return res.data
}

export const updateReport = async (
  projectId: number,
  reportData: CreateReportDto,
) => {
  const res = await apiClient.patch(
    API_URL + `/projects/${projectId}/reports/me/${reportData.id}`,
    reportData,
  )
  return res.data
}
