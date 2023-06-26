import { createRequire } from 'node:module'
import { ManifestTypeV3 } from './v3-type.mjs'

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

const manifest: ManifestTypeV3 = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  icons: {
    '128': 'public/icon-128.png',
  },
  permissions: ['storage', 'tabs', 'activeTab', 'contextMenus', 'webRequest', 'alarms', 'storage', 'webRequestBlocking', 'http://*/', 'https://*/'],
  host_permissions: ['https://api.footprint.network/*', 'https://www.footprint.network/*'],
  web_accessible_resources: [
    {
      resources: ['public/*', 'assets/*'],
      matches: ['<all_urls>'],
    },
  ],
  // content_security_policy: {
  //   // 'frame-ancestors': ["'self'", 'https://www.footprint.network/'],
  //   extension_pages: "script-src 'self'; object-src 'self'; frame-ancestors *;",
  // },
}

function getManifestV3(pageDirMap: { [x: string]: any }): ManifestTypeV3 {
  const pages = Object.keys(pageDirMap)

  if (pages.length === 0) {
    return manifest
  }

  try {
    if (pages.indexOf('options') > -1) {
      manifest.options_ui = {
        page: pageDirMap['options'],
      }
    }

    if (pages.indexOf('background') > -1) {
      manifest.background = {
        service_worker: pageDirMap['background'],
        type: 'module',
      }
    }

    if (pages.indexOf('popup') > -1) {
      manifest.action = {
        default_popup: pageDirMap['popup'],
        default_icon: 'public/icon-34.png',
      }
    }
    // 暂时不需要 new tab
    // if (pages.indexOf('newtab') > -1) {
    //   manifest.chrome_url_overrides = {
    //     newtab: pageDirMap['newtab'],
    //   }
    // }
    // 暂时不需要 bookmarks
    // if (pages.indexOf('bookmarks') > -1) {
    //   manifest.chrome_url_overrides = {
    //     bookmarks: pageDirMap['bookmarks'],
    //   }
    // }
    // 暂时不需要 history
    // if (pages.indexOf('history') > -1) {
    //   manifest.chrome_url_overrides = {
    //     history: pageDirMap['history'],
    //   }
    // }

    if (pages.indexOf('content') > -1) {
      manifest.content_scripts = [
        {
          matches: ['http://*/*', 'https://*/*', '<all_urls>'],
          js: [pageDirMap['content']],
          css: pageDirMap['content-css'],
          run_at: 'document_start',
        },
      ]
    }

    // if (pages.indexOf('devtools') > -1) {
    //   manifest.devtools_page = pageDirMap['devtools']
    // }
  } catch (error) {
    console.error(error)
    throw new Error('Invalid build')
  }

  return manifest
}

export default getManifestV3
