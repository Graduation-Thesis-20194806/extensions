import Excalidraw from '@excalidraw/excalidraw'
import { ImportedDataState } from '@excalidraw/excalidraw/types/data/types'
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import {
  AppState,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import browser from 'webextension-polyfill'
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  urlBasedLocalStorageKey,
} from '../app/localStorage'
import { debounce } from '../app/utilities'
import {
  loadAppState,
  saveAppState,
  subscribeToAppState,
} from '@/app/chromeStorage'
import {
  ActionKey,
  APP_REPORT_TAB_KEY,
  APP_STATE_KEY,
  UNIQUE_CODE,
  ViewMode,
} from '@/common/constant'
import { AppState as AppStateType } from '@/app/appState'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import {
  CreateCommentDto,
  CreateReportDto,
  EditCommentDto,
  reformatResponse,
  ReportComment,
  ReportType,
  Severity,
} from '@/common/types/report'
import { Alert, Button, ConfigProvider, message, Space, Tooltip } from 'antd'
import {
  ProfileOutlined,
  PushpinOutlined,
  SignatureOutlined,
} from '@ant-design/icons'
import { ReportEditView } from './ReportEditView'
import DOMPin from './DOMPin'
import { addClassRecursively } from '@/utils/dom'
import { convertFileToBase64 } from '@/utils/file'
import Comments from './Comments'

/**
 * Timeout used to debounce saving the drawing
 */
const SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300

/**
 * function used to create the local storage key
 * abstracted here to allow for alternative implementations
 */
const LOCAL_STORAGE_KEY_STRATEGY = urlBasedLocalStorageKey

/**
 * Global styles applied to blur the background
 */
const GlobalStyle = createGlobalStyle`
  .excalidraw.theme--dark {
    background-color: rgba(0, 0, 0, 0.288);
  }
`

enum FunctionEnum {
  DRAW = 'DRAW',
  POINTER = 'POINTER',
}

const getBrowserInfo = () => {
  if (!navigator?.userAgent) return undefined
  const ua = navigator.userAgent
  let OS = 'Unknown'
  if (ua.includes('Win')) OS = 'Windows'
  else if (ua.includes('Mac')) OS = 'MacOS'
  else if (ua.includes('Linux')) OS = 'Linux'
  else if (ua.includes('Android')) OS = 'Android'
  else if (ua.includes('like Mac')) OS = 'iOS'

  const browserMatch = ua.match(/(firefox|msie|chrome|safari|edg|opr)/i)
  const Browser = browserMatch ? browserMatch[0] : 'Unknown'
  const chromeVersion = /Chrome\/([0-9.]+)/.exec(navigator.userAgent)?.[1]
  const info = {
    os: OS,
    browser: Browser,
    isMobile: /Mobi|Android/i.test(ua),
    browserVersion: chromeVersion,
  }
  return info
}

const getScreenInfo = () => {
  return {
    resolution: `${window.screen.width}x${window.screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    colorDepth: window.screen.colorDepth,
  }
}

export default function Content() {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
  const [currentFunction, setCurrentFunction] = useState<
    FunctionEnum | undefined
  >()

  const [localStorageKey, setLocalStorageKey] = useState(
    LOCAL_STORAGE_KEY_STRATEGY(),
  )

  const [initialData, setInitialData] = useState<ImportedDataState>(
    loadFromLocalStorage(localStorageKey),
  )

  const [openReportScreen, setOpenReportScreen] = useState<boolean>(false)
  const [appState, setAppState] = useState<AppStateType | undefined>()
  const [comments, setComments] = useState<ReportComment[] | undefined>()
  const [report, setReport] = useState<CreateReportDto | undefined>()
  const [tabId, setTabId] = useState<string | undefined>()
  const [id, setId] = useState<number | undefined>()
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.REPORT)
  const [messageApi, contextHolder] = message.useMessage()
  const methods = useForm<CreateReportDto>()
  const { reset, handleSubmit, setValue, getValues, control } = methods
  const idWatch = useWatch({ control, name: 'id' })
  const setError = useCallback(
    (error: string) => {
      messageApi.open({
        type: 'error',
        content: error,
        duration: 10,
      })
    },
    [messageApi],
  )
  const handleMouseClick = useCallback(
    (e) => {
      if (currentFunction !== FunctionEnum.POINTER) return
      let domList = getValues('additionInfo.domPosition')
      let id = 0
      if (!domList) domList = []
      else if (domList.length) {
        id = domList[domList.length - 1].domId + 1
      }
      const domPath = DOMPin.handleClick(e, id)
      if (domPath) {
        domList.push({
          domId: id,
          domPath,
        })
        setValue('additionInfo.domPosition', domList)
      }
    },
    [currentFunction, getValues, setValue],
  )
  useEffect(() => {
    document.addEventListener('click', handleMouseClick)
    return () => {
      document.removeEventListener('click', handleMouseClick)
    }
  }, [handleMouseClick])
  useEffect(() => {
    loadAppState(APP_STATE_KEY).then((res) => {
      setAppState(res)
    })
    chrome.runtime.sendMessage(
      {
        action: ActionKey.GET_TAB_ID,
      },
      (response) => {
        if (response?.success) {
          setTabId(response.tabId)
        } else {
          setError(response?.error ?? 'Something wrong')
        }
      },
    )
  }, [])
  useEffect(() => {
    if (!tabId) return
    const url = window.location.href
    loadAppState(APP_REPORT_TAB_KEY).then((res) => {
      if (!res) return
      if (res[tabId] && res[tabId].url === url) {
        setId(res[tabId].id)
      }
    })
  }, [tabId])
  useEffect(() =>
    subscribeToAppState((appState) => {
      setAppState(appState)
    }, APP_STATE_KEY),
  )

  useEffect(() => {
    if (!appState) return
    if (!id) return
    return chrome.runtime.sendMessage(
      {
        action: ActionKey.GET_CURRENT_REPORT,
        payload: {
          projectId: appState.projectId,
          userId: appState.userId,
          reportId: id,
        },
      },
      (response) => {
        if (response?.success) {
          if (response.data) {
            const { item, comments } = reformatResponse(response.data)
            if (item.additionInfo?.domPosition?.length) {
              DOMPin.initializeCheckpoints(item.additionInfo.domPosition)
            }
            setReport(item)
            setComments(comments)
          }
        } else {
          setError(response?.error ?? 'Something wrong')
        }
      },
    )
  }, [appState, getValues, setValue, id])

  useEffect(() => {
    if (
      !appState?.projectId ||
      (report?.projectId && appState.projectId !== report.projectId)
    ) {
      console.log('go here', appState?.projectId, report?.projectId)
      setReport(undefined)
      const elements = document.querySelectorAll(
        `[id^="app-checkpoint-container-${UNIQUE_CODE}"]`,
      )
      elements.forEach((el) => el.remove())
      setId(undefined)
    }
  }, [appState?.projectId, report?.projectId])

  const saveDebounced = useMemo(
    () =>
      debounce((elements: readonly ExcalidrawElement[], state: AppState) => {
        saveToLocalStorage(localStorageKey, elements, state)
      }, SAVE_TO_LOCAL_STORAGE_TIMEOUT),
    [localStorageKey],
  )

  useEffect(() => {
    // handle when the url changes
    const handleHistoryUpdated = () => {
      saveDebounced.flush()
      const newLocalStorageKey = LOCAL_STORAGE_KEY_STRATEGY()
      setLocalStorageKey(newLocalStorageKey)
      setInitialData(loadFromLocalStorage(newLocalStorageKey))
    }
    const handleMessage = (message: any) => {
      if (message.action === 'historyUpdated') {
        handleHistoryUpdated()
      }
    }
    browser.runtime.onMessage.addListener(handleMessage)
    return () => browser.runtime.onMessage.removeListener(handleMessage)
  }, [saveDebounced])

  useEffect(() => {
    if (currentFunction === FunctionEnum.POINTER) {
      const containers = document.querySelectorAll('.app-pin-ignore')
      containers.forEach((container) => {
        addClassRecursively(container, 'app-pin-ignore')
      })
      DOMPin.activateHighlighter()
    } else DOMPin.deactivateHighlighter()
  }, [currentFunction])

  const resetReport = useCallback(() => {
    if (report) return reset(report)
    return reset({
      description: '',
      name: '',
      images: [],
      url: window.location.href,
      type: ReportType.BUG,
      severity: Severity.INFO,
      isPublic: false,
      additionInfo: { ...getBrowserInfo(), domPosition: [] },
    })
  }, [report, reset])

  useEffect(() => {
    resetReport()
  }, [resetReport])

  const onTakeScreenShot = useCallback(async () => {
    setOpenReportScreen(false)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    if (!appState?.userId) return
    const fileName = `screenshot-${Date.now()}.png`
    chrome.runtime.sendMessage(
      {
        action: ActionKey.SEND_TO_S3,
        payload: {
          fileName,
          userId: appState.userId,
        },
      },
      (response) => {
        if (response?.success) {
          const old = getValues('images') ?? []
          setValue('images', [
            ...old,
            {
              name: fileName,
              path: `bug-report/${appState.userId}/${fileName}`,
            },
          ])
          const newI = getValues('newImages') ?? []
          setValue('newImages', [
            ...newI,
            {
              name: fileName,
              path: `bug-report/${appState.userId}/${fileName}`,
            },
          ])
          setOpenReportScreen(true)
        } else {
          setError(response?.error ?? 'Something wrong')
        }
      },
    )
  }, [appState?.userId, getValues, setValue])

  const onSubmit = useCallback(
    (values: CreateReportDto) => {
      if (!appState?.projectId) return
      let action = ActionKey.CREATE_REPORT
      if (values.id) action = ActionKey.UPDATE_REPORT
      chrome.runtime.sendMessage(
        {
          action,
          payload: {
            data: values,
            projectId: appState.projectId,
            tabId,
          },
        },
        (response) => {
          if (response?.success) {
            messageApi.success('Submit sucessfully')
            setValue('id', response.report.id)
          } else {
            setError(response?.error ?? 'Something wrong')
          }
        },
      )
    },
    [appState?.currentReport, appState?.projectId, setValue, tabId],
  )
  const handleUpload = useCallback(
    async (file: any) => {
      if (!appState?.userId) return
      const fileName = `screenshot-${Date.now()}.png`
      const fileBase64 = await convertFileToBase64(file)
      chrome.runtime.sendMessage(
        {
          action: ActionKey.UPLOAD_FILE,
          payload: {
            fileName,
            file: fileBase64,
            userId: appState.userId,
          },
        },
        (response) => {
          console.log(response)
          if (response?.success) {
            const old = getValues('images') ?? []
            setValue('images', [
              ...old,
              {
                name: fileName,
                path: `bug-report/${appState.userId}/${fileName}`,
              },
            ])
            const newI = getValues('newImages') ?? []
            setValue('newImages', [
              ...newI,
              {
                name: fileName,
                path: `bug-report/${appState.userId}/${fileName}`,
              },
            ])
            setOpenReportScreen(true)
          } else {
            setError(response?.error ?? 'Something wrong')
          }
        },
      )
    },
    [appState?.userId, getValues, setError, setValue],
  )
  const onChangeViewMode = (value: ViewMode) => setViewMode(value)

  const onCreateComment = useCallback(
    (createCommentDto: CreateCommentDto) => {
      if (!appState?.userId || !appState?.projectId || !idWatch) return
      chrome.runtime.sendMessage(
        {
          action: ActionKey.CREATE_COMMENT,
          payload: {
            reportId: idWatch,
            projectId: appState.projectId,
            createCommentDto,
          },
        },
        (response) => {
          console.log(response)
          if (response?.success) {
            if (comments) setComments([...comments, response.data])
            else setComments([response.data])
          } else {
            setError(response?.error ?? 'Something wrong')
          }
        },
      )
    },
    [appState?.projectId, appState?.userId, idWatch],
  )

  const onEditComment = useCallback(
    (id: number, editComment: EditCommentDto) => {
      if (!appState?.userId || !appState?.projectId || !idWatch) return
      chrome.runtime.sendMessage(
        {
          action: ActionKey.UPDATE_COMMENT,
          payload: {
            reportId: idWatch,
            projectId: appState.projectId,
            commentId: id,
            editComment,
          },
        },
        (response) => {
          console.log(response)
          if (response?.success) {
            const commentOld = comments?.find((item) => item.id === id)
            if (!commentOld) return
            commentOld.content = response.data.content
            commentOld.updatedAt = response.data.updatedAt
            setComments(comments)
          } else {
            setError(response?.error ?? 'Something wrong')
          }
        },
      )
    },
    [appState?.projectId, appState?.userId, idWatch],
  )

  if (!appState?.userId) return <></>

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#008B8B',
        },
      }}
    >
      {contextHolder}
      <GlobalStyle />
      {currentFunction === FunctionEnum.DRAW && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <Excalidraw
            key={localStorageKey}
            ref={excalidrawRef}
            initialData={initialData}
            onChange={(
              elements: readonly ExcalidrawElement[],
              appState: AppState,
            ) => {
              saveDebounced(elements, appState)
            }}
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: false,
                clearCanvas: false,
                export: false,
                saveAsImage: false,
                saveToActiveFile: false,
                loadScene: false,
                theme: false,
              },
            }}
          />
        </div>
      )}
      {openReportScreen && (
        <ReportContainer>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
                display: viewMode === ViewMode.REPORT ? 'block' : 'none',
              }}
            >
              <ReportEditView
                onChangeViewMode={onChangeViewMode}
                onTakeScreenShot={onTakeScreenShot}
                handleUpload={handleUpload}
              />
            </form>
          </FormProvider>
          {appState?.userId && (
            <Comments
              onEditComment={onEditComment}
              user_id={appState.userId}
              visible={viewMode === ViewMode.COMMENTS}
              onChangeViewMode={onChangeViewMode}
              items={comments}
              onCreateComment={onCreateComment}
            />
          )}
        </ReportContainer>
      )}
      {appState?.userId && appState?.projectId && (
        <div
          style={{
            position: 'fixed',
            right: '3rem',
            bottom: '1rem',
            zIndex: 10000,
          }}
          className="app-pin-ignore"
        >
          <Space.Compact block>
            <Tooltip title="Open Drawing">
              <FunctionButton
                className="app-pin-ignore"
                icon={<SignatureOutlined />}
                onClick={() =>
                  setCurrentFunction((currentFunction) =>
                    currentFunction === FunctionEnum.DRAW
                      ? undefined
                      : FunctionEnum.DRAW,
                  )
                }
              />
            </Tooltip>
            <Tooltip title="Checkpoint">
              <FunctionButton
                className="app-pin-ignore"
                icon={<PushpinOutlined />}
                onClick={() => {
                  if (currentFunction !== FunctionEnum.POINTER)
                    setOpenReportScreen(false)
                  setCurrentFunction((currentFunction) =>
                    currentFunction === FunctionEnum.POINTER
                      ? undefined
                      : FunctionEnum.POINTER,
                  )
                }}
              />
            </Tooltip>
            <Tooltip title="Open Current Report">
              <FunctionButton
                className="app-pin-ignore"
                icon={<ProfileOutlined />}
                onClick={() => {
                  if (
                    !openReportScreen &&
                    currentFunction == FunctionEnum.POINTER
                  ) {
                    setCurrentFunction(undefined)
                  }
                  setOpenReportScreen((openReportScreen) => !openReportScreen)
                }}
              />
            </Tooltip>
          </Space.Compact>
        </div>
      )}
    </ConfigProvider>
  )
}

const FunctionButton = styled(Button)`
  font-size: 1.125rem;
  border: white;
  background: rgba(0, 0, 0, 0.5) !important;
  color: white;
  cursor: pointer;
`

const ReportContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  height: calc(100vh - 160px);
  width: 400px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  padding: 16px;
  overflow-y: auto;
  z-index: 10000;

  & .report-container-alert {
    margin-bottom: 16px;
  }
`
