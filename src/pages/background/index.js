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
    const walletList = message.data || walletsMap.has(currentTabId) ? walletsMap.get(currentTabId) : []
    if (walletList?.length > 0) {
      // ${walletList.join(',')}
      //select * from ethereum_token_transfers where block_timestamp >= date_add('day',-1,current_date) limit 10
      //0x000fe4cD429c6655528B5a73F317239358441C43,0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c,0x00006621a1800f5f0d498876ee324d92001fc475
      queryApi(`WITH datas as (select '0x000fe4cD429c6655528B5a73F317239358441C43,0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c,0x00006621a1800f5f0d498876ee324d92001fc475' as addressStr),
      addressList as (select lower(address) as address from datas cross join unnest(split(addressStr,','))  as tmp(address)),
      address_with_type as (
          select
              addressList.*,
              t."token_name",
              case
                  when t."token_name" is not null THEN 'token_address'
              else 'wallet_address'
              end as address_type
          from  addressList
          left join "token_info" t
              on t."token_address" = addressList.address
      )
      select awt.*,mfei.entity_name as entity_name from address_with_type awt
      left join "iceberg"."footprint"."entity_address_relations" ear
      on ear.address = awt.address
      left join "iceberg"."footprint"."money_flow_entity_info" mfei
      on ear.entity_id = mfei.entity_id`)
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

/**
 * 查询配置
 */
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
      if (data) {
        const cols = data.cols ?? []
        const rows = data.rows ?? []
        console.log('queryConfig cols rows:', cols, rows)
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
        const pkg = { version: 0 }
        if (objectList.length > 0) {
          const config = objectList[0]
          chrome.storage.local.set({ config: { ...config, currentVersion: pkg.version } })
          chrome.storage.local.set({ showUpdate: config.version > pkg.version })
        }
      }
    })
    .catch((err) => console.log('queryConfig error: ', err))
}
/**
 * 通过 sql api 查询数据
 * @param {*} querySql
 * @returns
 */
function queryApi(querySql) {
  console.log('queryApi querySql: \n', querySql)
  return fetch('https://api.footprint.network/api/v1/native', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': '3NI3RIJ77FuxfVvX',
    },
    body: JSON.stringify({ query: querySql }),
  }).then((response) => response.json())
}
