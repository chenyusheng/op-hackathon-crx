import React, { useEffect, useState } from 'react'
import { Button, Input, Space, Skeleton, List, Typography, message, Tooltip, Badge, Tag, Card } from 'antd'
import { LeftOutlined, SyncOutlined, BarChartOutlined } from '@ant-design/icons'
const { Title } = Typography
const { Search } = Input
import '@pages/index.css'
import logo from '@assets/img/logo.svg'

interface IViewItem {
  viewType?: string
  address?: string
  address_type?: string
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
      value && message.error('Please input a valid Optimism address')
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
      setConfig({
        entity_dashboard_url:
          'https://www.footprint.network/public/dashboard/Moneyflow-Case-Study%3A-Jump-Trading-(Entity)-Money-Flow-fp-5e8604f5-8ad3-42ed-ad40-9f6817869079?relative_date=past7days&entity=',
        single_wallet_dashboard_url:
          'https://www.footprint.network/public/dashboard/Wallet-Profile-of-Op-fp-fc9cc7f2-3ea9-4174-a45d-353db8863447?wallet_address=',
        token_holder_dashboard_url:
          'https://www.footprint.network/public/dashboard/Token-Tracker-for-Optimism-fp-2d6315aa-510b-4607-984a-c9038b0eddaa?token_address=',
      })
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
      case 'chain':
        return 'https://www.footprint.network/public/dashboard/Optimism-Dashboard-fp-4590cb5b-002b-4e4e-b2c4-b0583c6b7880?series_date-85136=2010-01-01~&series_date-91824=past90days~&chain=Optimism'
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
          <div
            style={{
              width: '100%',
              display: 'flex',
              marginBottom: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button
              type="link"
              onClick={(e) => {
                setViewItem(undefined)
              }}
            >
              <LeftOutlined rev={undefined} /> Back
            </Button>
            <Button
              type="primary"
              size="small"
              style={{ borderRadius: 5 }}
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <img className="flex" src={logo} style={{ width: 32, height: 32, marginRight: 10 }} alt="logo" />
              <Title className="text-red" style={{ margin: 0 }} level={3}>
                Optimism Extension
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
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
                margin: '0 0 10px 0',
                // justifyContent: 'center',
                width: 600,
              }}
            >
              <Button
                key="chain_ovew"
                type="link"
                style={{ padding: '10px 5px' }}
                icon={<BarChartOutlined rev={undefined} />}
                onClick={() => {
                  setViewItem({ viewType: 'chain' })
                }}
              >
                {'Chain Overview >'}
              </Button>
            </div>
            {/* <Title style={{ width: '100%', textAlign: 'left', margin: 0 }} level={5}>
              Optimism Wallet Addresses:
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
                          <SyncOutlined rev={undefined} />
                        </Button>
                      </Tooltip>
                    </div>
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
            <Typography.Link href="https://optimism.io/" target="_blank">
              Optimism{' '}
            </Typography.Link>
          </Typography.Text>
        </div>
      )}
    </div>
  )
}
