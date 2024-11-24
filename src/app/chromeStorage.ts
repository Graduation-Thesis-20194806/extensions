import browser from 'webextension-polyfill'
export async function forceSaveAppState(
  appState: any,
  key: string,
): Promise<void> {
  return browser.storage.sync.set({ [key]: appState })
}
/**
 * Asynchronously saves the app state
 */
export async function saveAppState(appState: any, key: string): Promise<void> {
  const result = await browser.storage.sync.get([key])
  if (result) {
    appState = { ...result[key], ...appState }
  }
  return browser.storage.sync.set({ [key]: appState })
}

/**
 * Asynchronously loads the app state
 */
export async function loadAppState(key: string): Promise<any> {
  const result = await browser.storage.sync.get([key])
  return result[key] ?? {}
}

export async function clearState(keys: string[]): Promise<any> {
  return browser.storage.sync.remove(keys)
}

/**
 * Subscribe to changes in the app state.
 * Pass a function which is called whenever the app state changes.
 * Returns a function which cleans up the subscription.
 */
export function subscribeToAppState(
  cb: (appState: any) => void,
  key: string,
): () => void {
  const onChangeHandler = (changes: any, namespace: any) => {
    if (namespace === 'sync' && key in changes) {
      const appStateChange = changes[key]
      const newAppState = appStateChange.newValue
      cb(newAppState)
    }
  }

  browser.storage.onChanged.addListener(onChangeHandler)
  return () => {
    browser.storage.onChanged.removeListener(onChangeHandler)
  }
}
