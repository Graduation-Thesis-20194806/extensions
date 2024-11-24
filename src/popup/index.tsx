import React, { createContext, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import Popup from './Popup'
import LoginContainer from './Login'
import styled from 'styled-components'
import ChooseProject from './ChooseProject'
import { Flex, Spin } from 'antd'
import { loadAppState, subscribeToAppState } from '@/app/chromeStorage'
import { APP_STATE_KEY } from '@/common/constant'
import { AppState } from '@excalidraw/excalidraw/types/types'
import { ConfigProvider } from 'antd'
import Header from './Header'
const PopupDiv = styled.div`
  width: 400px;
  padding: 8px 24px 24px 24px;
`
export enum RouterEnum {
  LOGIN = 'login',
  CHANGE_PROJECT = 'change',
  HOME = 'home',
}
export const RouterContext = createContext<any>({})
const PopupContainer = () => {
  const [router, setRouter] = useState<RouterEnum | undefined>()
  const [appState, setAppState] = useState<AppState | undefined>()
  useEffect(() => {
    loadAppState(APP_STATE_KEY).then((res) => {
      setAppState(res)
      if (res.isLoggedIn) {
        if (res.projectId) {
          setRouter(RouterEnum.HOME)
        } else setRouter(RouterEnum.CHANGE_PROJECT)
      } else {
        setRouter(RouterEnum.LOGIN)
      }
    })
  }, [])
  useEffect(() =>
    subscribeToAppState((appState) => setAppState(appState), APP_STATE_KEY),
  )
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#008B8B',
        },
      }}
    >
      <RouterContext.Provider value={{ setRouter, appState }}>
        <PopupDiv>
          {router && router !== RouterEnum.LOGIN && <Header />}
          {router === RouterEnum.LOGIN && <LoginContainer />}
          {router === RouterEnum.CHANGE_PROJECT && <ChooseProject />}
          {router === RouterEnum.HOME && <Popup />}
          {!router && (
            <Flex align="center" justify="center">
              <Spin />
            </Flex>
          )}
        </PopupDiv>
      </RouterContext.Provider>
    </ConfigProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <PopupContainer />
  </React.StrictMode>,
  document.getElementById('root'),
)
