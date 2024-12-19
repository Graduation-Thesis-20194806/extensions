import { ProjectRole } from '@/common/types/user'

export interface AppState {
  isLoggedIn: boolean
  userName: string
  userId?: number
  projectId?: number
  projectName?: string
  projectDomains?: string[]
  permission?: ProjectRole
  currentReport?: number
}

export const defaultAppState: AppState = {
  isLoggedIn: false,
  userName: 'Anonymous',
}
