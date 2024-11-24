import {
  forceSaveAppState,
  loadAppState,
  saveAppState,
} from '@/app/chromeStorage'
import { sendMessageToTabs } from '@/app/sendMessageToTabs'
import { ActionKey, APP_REPORT_TAB_KEY } from '@/common/constant'
import { addComment, updateComment } from '@/services/comment'
import { getPresignedUrl } from '@/services/file'
import { createReport, getMyReport, updateReport } from '@/services/report'
import { createTab } from '@/utils/tab'
import browser from 'webextension-polyfill'

// notify tabs when the url changes
browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
  sendMessageToTabs(
    {
      action: 'historyUpdated',
    },
    { filterTabs: (tab) => tab.id === details.tabId },
  )
})

chrome.tabs.onRemoved.addListener((tabId) => {
  loadAppState(APP_REPORT_TAB_KEY).then((res) => {
    delete res[tabId]
    return forceSaveAppState(res, APP_REPORT_TAB_KEY)
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message)
  if (message.action === ActionKey.SEND_TO_S3) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0]

        // Capture the visible tab (full page)
        chrome.tabs.captureVisibleTab(
          tab.windowId,
          { format: 'png', quality: 100 },
          (screenshotUrl) => {
            if (chrome.runtime.lastError) {
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message,
              })
              return
            }
            const { fileName, userId } = message.payload
            getPresignedUrl(fileName, userId)
              .then((response) => {
                const blob = base64ToBlob(screenshotUrl, 'image/png')

                const url = response.url
                return fetch(url, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'image/png' },
                  body: blob,
                })
              })
              .then((response) => {
                if (response.ok) {
                  sendResponse({ success: true, url: response.url })
                } else {
                  sendResponse({
                    success: false,
                    error: 'Failed to upload to S3',
                  })
                }
              })
              .catch((error) => {
                sendResponse({ success: false, error: error.message }) // Handle errors
              })
          },
        )
      }
    })
    return true
  }
  if (message.action === ActionKey.CREATE_REPORT) {
    const { data, projectId, tabId } = message.payload
    createReport(projectId, data).then((res) => {
      if (res) {
        if (tabId) {
          saveAppState(
            {
              [tabId]: {
                id: res.id,
                url: res.url,
              },
            },
            APP_REPORT_TAB_KEY,
          ).then(() => {
            sendResponse({ success: true, report: res })
          })
        } else sendResponse({ success: true, report: res })
      } else {
        sendResponse({ success: false, error: 'Error when create report' })
      }
    })
    return true
  }
  if (message.action === ActionKey.UPDATE_REPORT) {
    const { data, projectId, tabId } = message.payload
    updateReport(projectId, data).then((res) => {
      if (res?.id) {
        if (tabId) {
          saveAppState(
            {
              [tabId]: {
                id: res.id,
                url: res.url,
              },
            },
            APP_REPORT_TAB_KEY,
          ).then(() => {
            sendResponse({ success: true, report: res })
          })
        } else sendResponse({ success: true, report: res })
      } else {
        sendResponse({ success: false, error: 'Error when update report' })
      }
    })
    return true
  }
  if (message.action === ActionKey.OPEN_REPORT) {
    const { url, id } = message.payload
    createTab({ url }).then((res) => {
      saveAppState({ [res.id ?? 'current']: { id, url } }, APP_REPORT_TAB_KEY)
        .then(() => {
          sendResponse({ success: true })
        })
        .catch((e) => {
          sendResponse({ success: false, error: e.message })
        })
    })
    return true
  }
  if (message.action === ActionKey.GET_TAB_ID) {
    const tabId = sender.tab ? sender.tab.id : null
    if (tabId) sendResponse({ success: true, tabId })
    else sendResponse({ success: false, error: 'TabID is null' })
    return true
  }
  if (message.action === ActionKey.GET_CURRENT_REPORT) {
    const { projectId, reportId } = message.payload
    getMyReport(projectId, reportId)
      .then((res) => {
        sendResponse({ success: true, data: res })
      })
      .catch((e) => {
        sendResponse({ success: false, error: e.message })
      })
    return true
  }
  if (message.action === ActionKey.UPLOAD_FILE) {
    const { fileName, file, userId } = message.payload
    getPresignedUrl(fileName, userId)
      .then((response) => {
        const url = response.url
        const blob = base64ToBlob(file, file.type)
        return fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: blob,
        })
      })
      .then((response) => {
        if (response.ok) {
          sendResponse({ success: true, url: response.url })
        } else {
          sendResponse({
            success: false,
            error: 'Failed to upload to S3',
          })
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message }) // Handle errors
      })
    return true
  }
  if (message.action === ActionKey.CREATE_COMMENT) {
    const { projectId, reportId, createCommentDto } = message.payload
    addComment(projectId, reportId, createCommentDto)
      .then((res) => {
        if (res) {
          sendResponse({ success: true, data: res })
        } else {
          sendResponse({
            success: false,
            error: 'Failed to create Comment',
          })
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }
  if (message.action === ActionKey.UPDATE_COMMENT) {
    const { projectId, reportId, commentId, editComment } = message.payload
    updateComment(projectId, reportId, commentId, editComment)
      .then((res) => {
        if (res) {
          sendResponse({ success: true, data: res })
        } else {
          sendResponse({
            success: false,
            error: 'Failed to edit Comment',
          })
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }
})

function base64ToBlob(base64: any, fileType: string) {
  const byteCharacters = atob(base64.split(',')[1])
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024)
    const byteNumbers = new Array(slice.length)

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    byteArrays.push(new Uint8Array(byteNumbers))
  }

  return new Blob(byteArrays, { type: fileType })
}
