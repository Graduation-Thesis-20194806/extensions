import axios from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../utils/token'
import { API_URL } from '@/common/constant'

const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      const refreshToken = await getRefreshToken()

      if (refreshToken) {
        try {
          const response = await axios.post(API_URL + '/auth/refresh-token', {
            token: refreshToken,
          })

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data

          await setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          })

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          await clearTokens()
          return Promise.reject(refreshError)
        }
      } else {
        await clearTokens()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
