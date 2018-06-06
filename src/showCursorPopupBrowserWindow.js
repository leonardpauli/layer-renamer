// showCursorPopupBrowserWindow.js
// LayerRenamer
//
// Created by Leonard Pauli, jun 2018

/*
- npm i @leonardpauli/sketch-module-web-view@1.1.7-lp // (includes browserWindow.didClose)
- added `showCursorPopupBrowserWindow` shorthand (should be separate module, meh)
> USAGE: npm i @leonardpauli/sketch-module-web-view@1.1.7-lp, then:

```js
import {showCursorPopupBrowserWindow} from '@leonardpauli/sketch-module-web-view/lib/lp-utils'
export default function (context) {
  coscript.setShouldKeepAround(true); const val = 1; UI.message(val+' start')
  showCursorPopupBrowserWindow({
    // eg. localhost to webpack dev server during dev, but dist index for prod
    url: require('../resources/webview.html'),
    onLoadFinish: ()=> { console.log('UI loaded!') },
    onNativeLog: s=> { UI.message(s); webContents.executeJavaScript(`fn(${val})`) },
    // allow session tear down & force tear down start
    didClose: ()=> { coscript.setShouldKeepAround(false); throw(null) },
    // size: {x, y}, positionCursorOffset: {x, y}, reuseId: 'some',
  })
}
`
*/

/* global NSEvent */

import BrowserWindow from '@leonardpauli/sketch-module-web-view'

// showCursorPopupBrowserWindow
export default ({
  reuseId,
  url,
  onLoadFinish,
  onNativeLog,
  didClose,
  size = { x: 320, y: 180 },
  positionCursorOffset,
} = {}) => {
  if (!positionCursorOffset)
    positionCursorOffset = { x: size.x / 2, y: size.y / 2 }

  const browserWindow = new BrowserWindow({
    identifier: reuseId || undefined,
    width: size.x,
    height: size.y,
    show: false, // await content load
    minimizable: false,
    frame: false,
    alwaysOnTop: true,
    // acceptsFirstMouse: true,
    // titleBarStyle: 'hiddenInset', // or 'hidden'
  })

  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })
  if (didClose) browserWindow.didClose = didClose

  const mousePos = {
    x: NSEvent.mouseLocation().x * 1,
    y: NSEvent.mouseLocation().y * 1,
  }
  // const screenH =
  //   NSScreen.screens()
  //     .firstObject()
  //     .visibleFrame().size.height * 1
  browserWindow.setPosition(
    -1 * positionCursorOffset.x + mousePos.x,
    +1 * positionCursorOffset.y + mousePos.y, // + screenH,
    false
  )

  const { webContents } = browserWindow
  if (onLoadFinish) webContents.on('did-finish-load', onLoadFinish)
  if (onNativeLog) webContents.on('nativeLog', onNativeLog)

  if (url) browserWindow.loadURL(url)

  return browserWindow
}
