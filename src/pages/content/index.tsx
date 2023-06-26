import React from 'react'
import { createRoot } from 'react-dom/client'

function Content(): JSX.Element {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <p>
          Edit <code>src/pages/content/index.jsx</code> and save to reload.
        </p>
        <a>ethereum: 0xf584F8728B874a6a5c7A8d4d387C9aae9172D621 </a>
        <a className="text-blue-400" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React!
        </a>
        <p>Content styled</p>
      </header>
    </div>
  )
}

function findWalletAddresses() {
  // 使用正则表达式获取当前页面中所有以 0x 开头并且长度为 42 的地址
  const regex = /(0x[a-fA-F\d]{40})/g;
  const matches = document.documentElement.innerHTML.match(regex);
  return [...new Set(matches)]; // 去重后返回数组形式的结果
}

function init() {
  // const rootContainer = document.body
  // inject.js
  // const links = document.getElementsByTagName('a')
  // console.log('content links', Array.from(links))

  // find all wallet addresses in current page
  const result = findWalletAddresses()
  // console.log('content result', result)
  chrome.runtime.sendMessage({ type: 'match_eth_address', data: result })
}

document.addEventListener('DOMContentLoaded', init)
