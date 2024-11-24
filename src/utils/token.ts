import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/common/constant'
import browser from 'webextension-polyfill'

// utils/tokenStorage.js
export async function setTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string
  refreshToken: string
}) {
  await browser.storage.sync.set({
    [ACCESS_TOKEN_KEY]: accessToken,
    [REFRESH_TOKEN_KEY]: refreshToken,
  })
}

export async function getAccessToken() {
  const result = await browser.storage.sync.get([ACCESS_TOKEN_KEY])
  if (!result) return undefined
  return result[ACCESS_TOKEN_KEY]
}

export async function getRefreshToken() {
  const result = await browser.storage.sync.get([REFRESH_TOKEN_KEY])
  if (!result) return undefined
  return result[REFRESH_TOKEN_KEY]
}

export async function clearTokens() {
  await browser.storage.sync.remove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY])
}
