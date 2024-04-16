import React, { useEffect, useState } from 'react'
import { Button, Descriptions, Skeleton, Tag } from 'antd'

import pkg from '../../../package.json'
import '@pages/options/Options.css'

export default function Options(): JSX.Element {
  const [config, setConfig] = useState<any>(undefined)
  const [showUpdate, setShowUpdate] = useState(false)
  useEffect(() => {
    chrome.storage.local.get(['config', 'showUpdate'], function (result) {
      console.log('Options config is: ', result)
      //entity_dashboard_url ,single_wallet_dashboard_url ,token_holder_dashboard_url
      setConfig(result?.config)
      setShowUpdate(result?.showUpdate ?? false)
    })
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {config ? (
        <Descriptions title="Info">
          <Descriptions.Item label="Version">
            <div>
              V{pkg.version} {showUpdate && <Tag color="red">New Version</Tag>}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Download Link">
            <a href={config.version_download_url} rel="noreferrer" target="_blank">
              Click to download
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Website">
            <a href="https://optimism.io/" rel="noreferrer" target="_blank">
              https://optimism.io/
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Contact Us">
            <div>
              <Button style={{ padding: '0 10px' }} type="link" href="https://discord.gg/optimism" target="_blank" rel="noreferrer">
                Discord
              </Button>
              <Button style={{ padding: '0 10px' }} type="link" href="https://t.me/+Lv77x-a16GNlZDk1" target="_blank" rel="noreferrer">
                Telegram
              </Button>
              <Button style={{ padding: '0 10px' }} type="link" href="https://twitter.com/optimism" target="_blank" rel="noreferrer">
                Twitter
              </Button>
            </div>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Skeleton active></Skeleton>
      )}
    </div>
  )
}
