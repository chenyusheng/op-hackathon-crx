import React, { useEffect, useState } from 'react'
import { Button, Input, Space, Skeleton, List, Typography, message, Tooltip, Badge, Tag } from 'antd'
import { LeftOutlined, SyncOutlined } from '@ant-design/icons'
const { Title } = Typography
const { Search } = Input
import '@pages/index.css'
import logo from '@assets/img/logo.svg'

export default function Popup(): JSX.Element {
  const [addresses, setAddresses] = useState([])
  const [searchText, setSearchText] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<any>({})
  const [showUpdate, setShowUpdate] = useState(false)
  const onSearch = (value: string) => {
    console.log('onSearch', value)
    if (value) {
      setSearchText(value)
    } else {
      value && message.error('Please input a valid Ethereum address')
    }
  }
  const refreshWebPage = () => {
    // 获取当前选中的标签页
    setLoading(true)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // 刷新该标签页
      chrome.tabs.reload(tabs[0].id ?? 0)
    })
  }
  const onQueryAddress = () => {
    chrome.runtime.sendMessage(
      {
        type: 'query',
        sql: 'select * from ...',
      },
      (response) => {
        // 处理响应数据
        console.log('onQueryAddress response: ', response)
      }
    )
  }
  const onSync = () => {
    setLoading(true)
    chrome.runtime.sendMessage(
      {
        type: 'get_all_addresses',
      },
      (response) => {
        // 处理响应数据
        console.log('get_all_addresses response: ', response)
        setAddresses(response)
        setLoading(false)
      }
    )
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('popup message', message.type, message.data)
    if (message.type === 'match_eth_address') {
      const datas = message.data
      setAddresses(datas)
      setLoading(false)
    }
  })

  useEffect(() => {
    onSync()
    chrome.storage.local.get(['config', 'showUpdate'], function (result) {
      console.log('config is: ', result)
      //entity_dashboard_url ,single_wallet_dashboard_url ,token_holder_dashboard_url
      setConfig(
        result.config ?? {
          entity_dashboard_url:
            'https://www.footprint.network/public/dashboard/Moneyflow-Case-Study%3A-Jump-Trading-(Entity)-fp-abd73e52-8aaa-4fb5-8a79-8469fc1ba0ed?start_date=2023-6-1&entity=',
          single_wallet_dashboard_url:
            'https://www.footprint.network/public/dashboard/Moneyflow-Case-Study%3A-1-Wallet-fp-259fa7ec-1a65-493b-af37-fb66db6e2085?date_filter=thismonth&wallet_address=',
          token_holder_dashboard_url:
            'https://www.footprint.network/public/dashboard/Moneyflow-of-Token-Holder-fp-08b737e4-d4da-445f-a7d7-3eed9844bae4?date_filter=past7days~&token_address=',
        }
      )
      setShowUpdate(result?.showUpdate ?? false)
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 760, minHeight: 560, height: '100%', alignItems: 'center' }}>
      {searchText ? (
        <div className="flex flex-col" style={{ width: '100%' }}>
          <div className="flex flex-row justify-between mb-2">
            <Button
              type="link"
              onClick={(e) => {
                setSearchText(undefined)
              }}
            >
              <LeftOutlined /> Back
            </Button>
          </div>
          <iframe
            style={{
              overflow: 'hidden',
            }}
            // src="https://huaban.com/"
            // src="https://preview.footprint.network/public/dashboard/Fantom-GameFi-Overview-fp-b546b3ce-67da-43a4-aaac-165cfe6d9389?date__=past180days&chain=Fantom&protocol_type=GameFi"
            src={`https://www.footprint.network/public/dashboard/Moneyflow-Case-Study%3A-1-Wallet-fp-259fa7ec-1a65-493b-af37-fb66db6e2085?date_filter=thismonth&wallet_address=${searchText}`}
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
              {showUpdate && <Tag color="red" onClick={()=>{window.open(config?.version_download_url,'_blank')}}>New Version</Tag>}
            </div>

            <Search
              style={{ width: 500, margin: '10px 0' }}
              placeholder="input entity/token address"
              // defaultValue={'0xf584F8728B874a6a5c7A8d4d387C9aae9172D621'}
              allowClear
              onChange={(e) => {
                if (!e.target.value) {
                  setSearchText(undefined)
                }
              }}
              onSearch={onSearch}
              enterButton
            />
            {/* <Title style={{ width: '100%', textAlign: 'left', margin: 0 }} level={5}>
              Ethereum Wallet Addresses:
            </Title> */}
            <List
              style={{ width: 500 }}
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
              renderItem={(item: string, index) => (
                <List.Item
                  actions={[
                    <Button
                      key="profile"
                      type="link"
                      style={{ padding: '10px 0' }}
                      onClick={() => {
                        setSearchText(item)
                      }}
                    >
                      View profile
                    </Button>,
                  ]}
                >
                  <Skeleton title={false} loading={loading} active>
                    <Tooltip title={item}>
                      <Typography.Text mark>{index + 1}. </Typography.Text> {item.substr(0, 10) + '...' + item.substr(item.length - 10)}
                    </Tooltip>
                  </Skeleton>
                </List.Item>
              )}
            />
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
