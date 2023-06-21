console.log('Service Worker 👋')

// background.js
let currentTabId = null
let walletsMap = new Map()
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('onActivated activeInfo', activeInfo,walletsMap.has(activeInfo.tabId))
  const { tabId } = activeInfo
  currentTabId = tabId
  walletsMap.has(tabId) ? updateBadgeText(walletsMap.get(tabId).length.toString()): updateBadgeText('')
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background message', message.type)
  if (message.type === 'match_eth_address') {
    const datas = message.data
    walletsMap.set(currentTabId, datas)
    if (datas.length > 0) {
      updateBadgeText(datas.length.toString())
    }else{
      updateBadgeText('')
    }
  }
  if(message.type === 'get_all_addresses'){
    console.log('get_all_addresses',currentTabId,walletsMap.has(currentTabId))
    sendResponse(walletsMap.has(currentTabId)? walletsMap.get(currentTabId):[])
  }
})
function updateBadgeText(text) {
  chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
  chrome.action.setBadgeText({text: text});
}

