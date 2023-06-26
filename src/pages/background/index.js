
console.log('Service Worker 👋')
// background.js
let currentTabId = null
let walletsMap = new Map()
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('onActivated activeInfo', activeInfo, walletsMap.has(activeInfo.tabId))
  const { tabId } = activeInfo
  currentTabId = tabId
  walletsMap.has(tabId) ? updateBadgeText(walletsMap.get(tabId).length.toString()) : updateBadgeText('')
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background message', message.type)
  if (message.type === 'match_eth_address') {
    const datas = message.data
    walletsMap.set(currentTabId, datas)
    if (datas.length > 0) {
      updateBadgeText(datas.length.toString())
    } else {
      updateBadgeText('')
    }
  }
  if (message.type === 'get_all_addresses') {
    console.log('get_all_addresses', currentTabId, walletsMap.has(currentTabId))
    sendResponse(walletsMap.has(currentTabId) ? walletsMap.get(currentTabId) : [])
    queryConfig()
  }
  if (message.type === 'get_all_addresses_with_type') {
    console.log('get_all_addresses_with_type', currentTabId, walletsMap.has(currentTabId))
    const walletList = walletsMap.has(currentTabId) ? walletsMap.get(currentTabId) : []
    if (walletList?.length > 0) {
      const tempList = walletList.map((addr) => `'${addr}'`)
      //select * from ethereum_token_transfers where block_timestamp >= date_add('day',-1,current_date) limit 10
      queryApi(`select * from ** where address in [${tempList.join(',')}]`)
        .then(({ data }) => {
          console.log('query sendResponse: \n', data)
          sendResponse(data)
        })
        .catch((err) => {
          console.log('query error: ', err)
          sendResponse([])
        })
    } else {
      sendResponse([])
    }
  }
  if (message.type === 'query') {
    console.log('query', message.sql)
    queryApi(message.sql)
      .then(({ data }) => {
        console.log('query sendResponse: \n', data)
        sendResponse(data)
      })
      .catch((err) => {
        console.log('query error: ', err)
      })
  }
  return true
})

chrome.runtime.onStartup.addListener(() => {
  console.log('brower onStartup!')
  queryConfig()
})

function updateBadgeText(text) {
  chrome.storage.local.get(['showUpdate'], function (result) {
    console.log('showUpdate', result)
    if (result.showUpdate) {
      chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })
      chrome.action.setBadgeText({ text: 'new' })
    } else {
      chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })
      chrome.action.setBadgeText({ text: text })
    }
  })
}

function queryConfig() {
  fetch('https://www.footprint.network/api/v1/public/card/89878614-d84d-4333-bc77-00141a71b6ca/query', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      console.log('queryConfig response:', response)
      return response.json()
    })
    .then(({ data }) => {
      if(data){
        const cols = data.cols??[]
        const rows  = data.rows??[]
        console.log('queryConfig cols rows:', cols,rows)
        const objectList = []
        rows.forEach((row) => {
          const object = {}
          cols.forEach((col, index) => {
            object[col.name] = row[index]
          })
          objectList.push(object)
        })
        console.log('queryConfig data:', objectList)
        // TODO: 这里设置版本号
        const pkg = {version: 0}
        if(objectList.length > 0){
          const config = objectList[0]
          chrome.storage.local.set({ config: {...config,currentVersion: pkg.version}  })
          chrome.storage.local.set({ showUpdate: config.version > pkg.version })
      }}
    })
    .catch((err) => console.log('queryConfig error: ', err))
}

function queryApi(querySql) {
  return fetch('https://api.footprint.network/api/v1/native', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': '3NI3RIJ77FuxfVvX',
    },
    body: JSON.stringify({ query: querySql }),
  }).then((response) => response.json())
}
