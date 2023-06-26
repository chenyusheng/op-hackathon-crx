import React from 'react'
import { createRoot } from 'react-dom/client'

const ETH_ADDRESS_REGEX = /^(0x)?[0-9a-f]{40}$/i; // 匹配以太坊地址的正则表达式

function isETHAddress(address: string): boolean {
  return ETH_ADDRESS_REGEX.test(address);
}

function getEthAddressesFromText(text: string): string[] {
  const parts = text.trim().split(/[\s\n'";:=<>\\\/]/g);
  return Array.from(new Set(parts.filter(isETHAddress)));
}

function highlightAddresses(): void {
  const allElements = document.getElementsByTagName('*');
  console.log('content highlightAddresses allElements', allElements)
  const allAddress = []
  for (let i = 0; i < allElements.length; i++) {
    const currentElement = allElements[i] as HTMLElement | null;
    if (!currentElement) {
      continue;
    }

    if (currentElement.tagName === 'SCRIPT' || currentElement.tagName === 'STYLE') {
      continue; // 在 script 和 style 标签中不处理
    }

    if (currentElement.textContent) {
      const addresses = getEthAddressesFromText(currentElement.textContent);
      console.log('content highlightAddresses currentElement addresses', addresses)
      allAddress.push(...addresses)
      if (addresses.length > 0) {
        addresses.forEach((address: string) => {
          const newHTML = currentElement.innerHTML.replace(
            new RegExp(`(${address})(?![^<]*>)`, 'gi'), // 替换地址字符串为带背景色的字符串
            `<span style='background-color: yellow'>${address}</span>`
          );
          currentElement.innerHTML = newHTML;
        });
      }
    }
  }
  console.log('content highlightAddresses allAddress', allAddress?.length, allAddress)
}

function findWalletAddresses() {
  // 使用正则表达式获取当前页面中所有以 0x 开头并且长度为 42 的地址
  const regex = /(0x[a-fA-F\d]{40})/g
  console.log('content findWalletAddresses document\n', document.documentElement)
  const matches = document.documentElement.innerHTML.match(regex)
  // const matches2 = document.documentElement.innerHTML.match(regex)
  return [...new Set(matches)].reverse() // 去重后返回数组形式的结果
}

function fetchAddressInfo() {
  const result = findWalletAddresses()
  // console.log('content result', result)
  chrome.runtime.sendMessage({ type: 'match_eth_address', data: result })
}

function init() {
  // const rootContainer = document.body
  // inject.js
  // const links = document.getElementsByTagName('a')
  // console.log('content links', Array.from(links))

  // find all wallet addresses in current page
  fetchAddressInfo()
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type === 'refresh_address') {
      console.log('content refresh_address')
      fetchAddressInfo()
    }
  })
  // highlightAddresses()
}

document.addEventListener('DOMContentLoaded', init)
