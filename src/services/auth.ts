import { LoginDto } from '@/common/types/user'
import apiClient from './api'
import { API_URL, APP_REPORT_TAB_KEY, APP_STATE_KEY } from '@/common/constant'
import { clearTokens, setTokens } from '@/utils/token'
import { clearState, saveAppState } from '@/app/chromeStorage'
import { AppState } from '@/app/appState'

export const login = async (loginDto: LoginDto) => {
  const res = await apiClient.post(API_URL + '/auth/login', loginDto)
  if (res.data) {
    const { refreshToken, accessToken, user } = res.data
    await setTokens({ accessToken, refreshToken })
    await saveAppState(
      {
        isLoggedIn: true,
        userName: user.username,
        userId: user.id,
      } as AppState,
      APP_STATE_KEY,
    )
    return true
  }
  return false
}

export const logout = async () => {
  await clearTokens()
  await clearState([APP_STATE_KEY, APP_REPORT_TAB_KEY])
}
