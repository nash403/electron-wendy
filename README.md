electron-wendy
===
A window manager for your Electron apps !

Installation
---
  
  `npm i --save electron-wendy` or `git clone https://github.com/nash403/electron-wendy.git`

Usage
---
### TL;DR:
`Wendy` is a window manager for Electron that provides convenient methods to create, remove, replace or give names to windows/modals.

With Wendy you can create and show a window at the same time and even pass argument to the new window in a single call:

```js
const { app } = require('electron')
const path = require('path')
const Wendy = require('electron-wendy')
app.on('ready', () => {
  const mainWindow = Wendy.create('mainWin', {
    showNow: true,
    showPath: path.resolve(__dirname, '..', 'some-location', 'index.html'),
    showArgs: { data: 'hello' }
  }) // this creates a window called 'mainWin' and shows it. window.__args__ will then be populated in the new window
})

/**
  * To show the window immediately at creation, the property 'showNow' must be set to true,
  * otherwise you need to call showUrl on the returned instance.
  */
```

This package relies on the simple but powerful package [electron-window](https://github.com/jprichardson/electron-window). You can go and see their repo for more informations.

### API Fields
#### windows
Object that keeps track of all windows created by Wendy.

### API Methods

#### create([name], [options])
Class method that creates a new BrowserWindow with the following default options: { show: false, width:600, height:400 }.

#### createModal(parent, [name], [options])
Creates a modal window whose parent window is `parent`. Properties `name` and and `options` are optional and same as for create except that default width is now 400 and height is 250.

#### createModalWithResponse(parent, eventName, [name], [options])
Same as above except that you must give an `eventName` that is used to transfer the response data from the modal to the parent window.

In the modal window, when you are finished and need to emit the response, send via ipcRenderer a message with your data to the channel provided as argument above. Then in the parent window (with window instance, not with ipcRenderer !!), listen for an event on that channel.

Example:

```js
// in the renderer process of the parent window
const Wendy = require('electron-wendy')
document.getElementById('modalise-btn').onclick = function () {
  let thisWindow = require('electron').remote.getCurrentWindow()
  let modal = Wendy.createModalWithResponse(thisWindow,'some-channel-name')
  thisWindow.once('some-channel-name', (...response) => {
    console.log('your response is here !', ...response)
  })
}

// in the renderer process of your modal
document.getElementById('close-btn').onclick = function () {
  require('electron').ipcRenderer.send('some-channel-name',{data:'some data 1'}, {status:'some data 2'})
  window.close() // You should always close the modal after emitting your result
}
```

#### getName(win)
Retrieves the name of the given window or `null` if not found

#### getByName(name)
Gets the window named by the given parameter.

**Note:** If you have stored a reference to a window created with Wendy you can check the name at the property *winName*.

#### getById(id)
Gets the window whose id is the given parameter or `null` if not found

#### has(name)
Tests if Wendy is currenty managing a window named by the given parameter. Returns `true` or `false`.

#### add(win, [name])
If you somehow have a window instance created without Wendy, you can add it to Wendy with this method.

#### remove(win)
Removes the given window from Wendy.

#### replace(name, newWindowOptions)
Removes a window whose name is `name` and creates a new one with the same name. `newWindowOptions` are the same as the *create* method.

#### on(evName, callback), once(evName, callback), off(evName, callback)
Wendy has a `emitter` property that is a Node.js [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter). With these methods you can register and unregister events with Wendy.

#### emit(evName, options, [...args])
Emits events through the `emmitter` property of Wendy.

* `options` is an object you can set with the following properties:
  - `options.emittedBy`: `BrowserWindow` instance that initiated the event.
  - `options.target`: `string` or `BrowserWindow` that represents the target window for this event.
* `...args` is a set of argument that can be passed through this event.

### Methods in the created BrowserWindow instance
#### showUrl(indexPath, [someArgs], [callback])
Shows the url. When the url is finished loading, the callback is returned. If the optional argsForRenderer is set then __args__ will be a global object for the page in the renderer process. This is a convenient way to pass arguments from the main process to the renderer process.

**Note :** All other methods available in [electron-window](https://github.com/jprichardson/electron-window) are also available in the instance returned by Wendy.

### Native dialogs
Wendy also provides links to the Electron native functions for dialogs (`showOpenDialog`, `showSaveDialog`, `showMessageBox` and `showErrorBox`). You can read the related doc [here](http://electron.atom.io/docs/api/dialog/).



License
---
MIT

