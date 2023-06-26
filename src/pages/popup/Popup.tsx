import React, { useEffect, useState } from 'react'
import { Button, Input, Space, Skeleton, List, Typography, message, Tooltip, Badge, Tag, Card } from 'antd'
import { LeftOutlined, SyncOutlined } from '@ant-design/icons'
const { Title } = Typography
const { Search } = Input
import '@pages/index.css'
import logo from '@assets/img/logo.svg'

interface IViewItem {
  viewType?: string
  address: string
  address_type: string
  entity_name?: string
  token_name?: string
}
export default function Popup(): JSX.Element {
  const [addresses, setAddresses] = useState([])
  const [viewItem, setViewItem] = useState<IViewItem | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<any>({})
  const [showUpdate, setShowUpdate] = useState(false)
  const regex = /(0x[a-fA-F\d]{40})/g
  const onSearch = (value: string) => {
    console.log('onSearch', value, value.match(regex))
    if (value.match(regex) != null) {
      onSync([value])
    } else {
      value && message.error('Please input a valid Ethereum address')
    }
  }

  // 刷新该标签页
  const refreshWebPage = () => {
    setLoading(true)
    // 获取当前选中的标签页
    // chrome.runtime.sendMessage({ type: 'refresh_address'})
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.reload(tabs[0].id ?? 0)
    })
  }

  const onSync = (addressList?: string[]) => {
    setLoading(true)
    chrome.runtime.sendMessage(
      {
        type: 'get_all_addresses_with_type',
        data: addressList,
      },
      (response) => {
        // 处理响应数据
        console.log('get_all_addresses_with_type response: ', response)
        setAddresses(response)
        setLoading(false)
      }
    )
  }

  useEffect(() => {
    if (addresses.length <= 0) {
      onSync()
    }
    chrome.runtime.sendMessage({
      type: 'query_config',
    })
    chrome.storage.local.get(['config', 'showUpdate'], function (result) {
      console.log('config is: ', result?.config, result?.showUpdate)
      //entity_dashboard_url ,single_wallet_dashboard_url ,token_holder_dashboard_url
      setConfig(
        result.config ?? {
          entity_dashboard_url:
            'https://www.footprint.network/public/dashboard/Moneyflow-Case-Study%3A-Jump-Trading-(Entity)-Money-Flow-fp-5e8604f5-8ad3-42ed-ad40-9f6817869079?relative_date=past7days&entity=',
          single_wallet_dashboard_url:
            'https://www.footprint.network/public/dashboard/Moneyflow-Case-Study%3A-1-Wallet-fp-d4de0e92-51ff-4ff5-bd32-4ca8ea505ca2?date_filter=thismonth&wallet_address=',
          token_holder_dashboard_url:
            'https://www.footprint.network/public/dashboard/Moneyflow-of-Token-Holder-Money-Flow-fp-0f01309d-bb47-470c-883b-fb150ad20e49?date_filter=past7days~&token_address=',
        }
      )
      setShowUpdate(result?.showUpdate ?? false)
    })
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('popup message', message.type, message.data)
      if (message.type === 'match_eth_address') {
        onSync()
      }
    })
    return () => {
      chrome.runtime.onMessage.removeListener(() => {
        console.log('remove onMessage Listener')
      })
    }
  }, [])

  const iframeUrl = (item: IViewItem) => {
    switch (item.viewType) {
      case 'entity':
        return config.entity_dashboard_url + item.entity_name
      case 'token':
        return config.token_holder_dashboard_url + item.address
      case 'wallet':
      default:
        return config.single_wallet_dashboard_url + item.address
    }
  }

  function getActionItem(item: IViewItem): React.ReactNode[] {
    const actionItems: React.ReactNode[] = []
    if (item.address_type === 'wallet_address') {
      actionItems.push(
        <Button
          key="wallet_profile"
          type="link"
          style={{ padding: '10px 5px' }}
          onClick={() => {
            setViewItem({ ...item, viewType: 'wallet' })
          }}
        >
          wallet profile
        </Button>
      )
    }
    if (item.address_type === 'token_address') {
      actionItems.push(
        <Button
          key="token_address"
          type="link"
          style={{ padding: '10px 5px' }}
          onClick={() => {
            setViewItem({ ...item, viewType: 'token' })
          }}
        >
          token profile
        </Button>
      )
    }
    if (item.entity_name) {
      actionItems.push(
        <Button
          key="entity"
          type="link"
          style={{ padding: '10px 5px' }}
          onClick={() => {
            setViewItem({ ...item, viewType: 'entity' })
          }}
        >
          entity profile
        </Button>
      )
    }
    return actionItems
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 760, minHeight: 560, height: '100%', alignItems: 'center' }}>
      {viewItem ? (
        <div style={{ width: '100%' }}>
          <div style={{ width: '100%', display: 'flex', marginBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              type="link"
              onClick={(e) => {
                setViewItem(undefined)
              }}
            >
              <LeftOutlined /> Back
            </Button>
            <Button
              type="primary"
              size='small'
              style={{borderRadius: 5}}
              onClick={(e) => {
                window.open(iframeUrl(viewItem), '_blank')
              }}
            >
              View full screen
            </Button>
          </div>
          <iframe
            style={{
              overflow: 'hidden',
            }}
            // src="https://huaban.com/"
            // src="https://preview.footprint.network/public/dashboard/Fantom-GameFi-Overview-fp-b546b3ce-67da-43a4-aaac-165cfe6d9389?date__=past180days&chain=Fantom&protocol_type=GameFi"
            src={iframeUrl(viewItem)}
            frameBorder="0"
            width={'100%'}
            height={520}
          ></iframe>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', alignContent: 'center', justifyContent: 'center', width: '100%' }}>
              <img className="flex" src={logo} style={{ width: 32, height: 32, marginRight: 10 }} alt="logo" />
              <Title className="text-red" style={{ margin: 0 }} level={3}>
                MoneyFlow Extension
              </Title>
              {showUpdate && (
                <Tag
                  color="red"
                  style={{ marginLeft: 5, cursor: 'pointer' }}
                  onClick={() => {
                    window.open(config?.version_download_url, '_blank')
                  }}
                >
                  New Version
                </Tag>
              )}
            </div>

            <Search
              style={{ width: 600, margin: '10px 0' }}
              placeholder="input entity/token address"
              // defaultValue={'0xf584F8728B874a6a5c7A8d4d387C9aae9172D621'}
              allowClear
              onChange={(e) => {
                if (!e.target.value) {
                  setViewItem(undefined)
                }
              }}
              onSearch={onSearch}
              enterButton
            />
            {/* <Title style={{ width: '100%', textAlign: 'left', margin: 0 }} level={5}>
              Ethereum Wallet Addresses:
            </Title> */}
            {loading ? (
              <Skeleton style={{ width: 600 }} title={false} loading={loading} active></Skeleton>
            ) : (
              <List
                style={{ width: 600 }}
                header={
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      Detected {addresses?.length} Addresses:{' '}
                      <Tooltip title="Refresh">
                        <Button
                          id="rotate-button"
                          style={{ padding: 5 }}
                          type="link"
                          onClick={() => {
                            refreshWebPage()
                          }}
                        >
                          <SyncOutlined />
                        </Button>
                      </Tooltip>
                    </div>
                    <Tooltip title="If you can't find your address profile, please submit your address directly.">
                      <Button
                        type="primary"
                        size="small"
                        style={{ borderRadius: 5 }}
                        onClick={() => {
                          // onQueryAddress()
                          window.open('https://www.footprint.network/submit/contract/add', '_blank')
                        }}
                      >
                        Submit Address
                      </Button>
                    </Tooltip>
                  </div>
                }
                // footer={<div>Footer</div>}
                bordered
                dataSource={addresses}
                renderItem={(item: IViewItem, index) => (
                  <List.Item actions={getActionItem(item)}>
                    <Tooltip title={item.address}>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div>
                          <Typography.Text mark>{index + 1}. </Typography.Text>{' '}
                          {item.address.substr(0, 8) + '...' + item.address.substr(item.address.length - 8)}
                        </div>
                        <div
                          style={{
                            width: '100%',
                            marginTop: 3,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                            fontSize: 8,
                          }}
                        >
                          {item.address_type === 'wallet_address' && (
                            <Tag bordered={false} color="green">
                              wallet
                            </Tag>
                          )}
                          {item.address_type === 'token_address' && (
                            <Tag bordered={false} color="cyan">
                              {item.token_name}
                            </Tag>
                          )}
                          {item.entity_name && (
                            <Tag bordered={false} color="blue">
                              {item.entity_name}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </Tooltip>
                  </List.Item>
                )}
              />
            )}
          </div>
          <Typography.Text style={{ width: '100%', textAlign: 'center', marginTop: 5 }}>
            Power by:{' '}
            <Typography.Link href="https://www.footprint.network/" target="_blank">
              Footprint Analytics{' '}
            </Typography.Link>
          </Typography.Text>
        </div>
      )}
    </div>
  )
}
