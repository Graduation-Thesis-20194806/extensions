import { AppState, defaultAppState } from '@/app/appState'
import { Report } from '@/common/types/report'
import { createContext } from 'react'

const ContentContext = createContext<{
  appState: AppState
  reportState?: Report
}>({
  appState: defaultAppState,
})
export default ContentContext
