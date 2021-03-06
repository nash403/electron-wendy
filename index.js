const EventEmitter = new (require('events').EventEmitter)()
const {dialog} = require('electron')
const winmanager = require('electron-window')

let  Wendy = {
  emitter: EventEmitter,
  /**
   * @type {object} windows - the list of the windows managed by Wendy
   */
  get windows() {
    return winmanager.windows;
  },
  /**
   * Registers a listener with the given {evName} and {callback}.
   *
   * NOTE: {EventEmitter.on()} seem to alter the callback function, so if you want to later remove the handler you'll
   * want to store the callback in a variable!
   *
   * @param {string} evName - The name of the event.
   * @param {function} callback
   * @returns {Wendy}
   */
  on (evName, callback) {
    this.emitter.on(evName, callback)
    return this
  },
  /**
   * Registers a one time listener with the given {evName} and {callback}.
   */
  once (evName, callback) {
    this.emitter.once(evName, callback)
    return this
  },
  /**
   * Removes the listener for the given {evName} and {handler}.
   *
   * @param {string} evName
   * @param {function} handler
   * @returns {Wendy}
   */
  off (evName, handler) {
    this.emitter.removeListener(evName, handler)
    return this
  },
  /**
   * Emits an event.
   *
   * @param {string} evName
   * @param {object} [options]
   * @param {string | BrowserWindow} [options.target] - The name of the target window or the targeted window itself.
   * @param {BrowserWindow} [options.emittedBy] - The window that sent the event.
   * @param {*} ...arg - the rest of the arguments 
   * @returns {Wendy}
   */
  emit (evName, options, ...arg) {
    let target

    if (!!options && typeof options === 'object') {
      target = typeof options.target === 'string' ? options.target : ( this.getName(options.target) || options.target )
    }
    this.emitter.emit(evName, {
      emittedBy: options.emittedBy,
      target,
      name: evName
    }, ...arg)
    return this
  },
  /**
   * Creates a BrowserWindow instance with default width 600 and height 400, and returns it. The {options} argument can take every
   * option that BrowserWindow can take. This method will consider {name} as {options} if it is not a string.
   *
   * @param {string} [name] - the name to assign to the created window
   * @param {object} [options] - any {BrowserWindow} options.
   * @param {boolean} [options.showNow] - option that tells Wendy to call showUrl on the window immediately after creating it.
   * If set to true you must also set [options.showPath] and optionnaly [options.showArgs] & [options.showCb]
   * 
   * NOTE: {BrowserWindow.showUrl} from the newly created window instance takes care of showing the window after
   * the renderer process has done drawing for the first time so you don't need to set {options.show = true}
   * @returns {BrowserWindow}
   */
  create(name, options) {
    if (typeof name !== 'string') {
      options = name || {}
      name = null
    }
    let win = winmanager.createWindow(Object.assign({width:600,height:400},options));
    if (name) {
      win.winName = name
    }
    let now = !!options.showNow
    if (now) {
      win.showUrl(options.showPath, options.showArgs, options.showCb)
    }
    return win
  },
  /**
   * Creates a BrowserWindow instance as a modal with default width 400 and height 250, and returns it.
   * This method uses {create} to create the modal window
   *
   * @param {BrowserWindow} parent - the parent window
   * @param {string} [name] - the name to assign to the created modal
   * @param {object} [options] - same as {create}
   * @returns {BrowserWindow}
   */
  createModal(parent, name, options) {
    if (typeof parent !== 'object') {
      throw new Error('Modal window must have a parent window')
    }
    if (typeof name !== 'string') {
      options = name || {}
      name = null
    }
    let args = []
    if (name) args.push(name)
    if (options) args.push(Object.assign({modal:true, parent, width: 400, height: 250},options))

    return this.create(...args)
  },
  /**
   * Creates a modal window as {createModal} would but also registers a listener to handle a response from this modal.
   * In the modal window you'll have to send (via ipcRenderer) the response to the main process on a given channel. You must call window.close()
   * right after that. In the parent window you have to listen (preferably once and in a function call) to that channel.
   * 
   * NOTE: In the parent window you have to call "<CurrentWindowInstance>.on" to receive the response and not "ipcRenderer.on" !!
   * 
   * @param {BrowserWindow} parent - the parent window
   * @param {string} [evName] - the name of the channel on which the modal will respond. Default is 'md-response'
   * @param {string} [name] - the name to assign to the created modal
   * @param {object} [options] - same as {create}
   */
  createModalWithResponse(parent, evName, name, options) {
    if (!!!evName) evName = 'md-response'
    ipcMain.once(evName, (ev,...arg)=>{
      parent.emit(evName, ...arg)
    })
    return this.createModal(parent, name, options)
  },
  /**
   * Takes a BrowserWindow and returns the name it's stored under or null otherwise.
   *
   * @param {BrowserWindow} win
   * @returns {null|string}
   */
  getName (win) {
    let res = winmanager.windows[Object.keys(winmanager.windows).find(key => {
      return winmanager.windows[key] === win
    })]
    return res ? res.winName : null
  },
  /**
   * Returns a BrowserWindow stored under the given {name} otherwise null.
   *
   * @param {string} name
   * @returns {null|BrowserWindow}
   */
  getByName (name) {
    return winmanager.windows[Object.keys(winmanager.windows).find(key => {
        return winmanager.windows[key].winName === name
    })] || null
  },
  /**
   * Returns a BrowserWindow which id is the given {id} otherwise null.
   *
   * @param {number} id
   * @returns {null|BrowserWindow}
   */
  getById (id) {
    return winmanager.windows[id] || null
  },
  /**
   * Returns true/false whether a BrowserWindow with the given {name} has been added.
   *
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.getByName(name) ? true : false;
  },
  /**
   * Adds a BrowserWindow to the manager with a given optional name. Throws if a window with that name already exists.
   *
   * @param {BrowserWindow} win
   * @param {string} [name]
   * @return {Wendy}
   */
  add(win, name) {
    if (!win || typeof win !== 'object') {
      throw new Error(`Can't add window: win must be an object`)
    }
    win.unref = winmanager._unref.bind(win)
    win.once('close', win.unref)
    if (typeof name === 'string') {
      win.winName = name
    }
    winmanager.windows[win.id] = win
  },
  /**
   * Removes the window from the list.
   *
   * @param {BrowserWindow} window
   */
  remove(win) {
    let toremove = winmanager.windows[Object.keys(winmanager.windows).find(key => {
        return winmanager.windows[key] === win
    })]
    if (toremove) toremove.unref()
  },
  /**
   * Replaces {name} window and creates a new one with the same name and with the options described by {newWinOptions}
   */
  replace(name, newWinOptions) {
    this.remove(this.getByName(name))
    return this.create(name, newWinOptions)
  },
  // Aliases for the other 'electron-window' functions
  _loadURLWithArgs:  winmanager._loadURLWithArgs,
  _loadUrlWithArgs: winmanager._loadURLWithArgs, // backwards-compatibility
  _unref: winmanager._unref,

  // Aliases for Electron dialog helpers
  showOpenDialog: dialog.showOpenDialog,
  showSaveDialog: dialog.showSaveDialog,
  showMessageBox: dialog.showMessageBox,
  showErrorBox: dialog.showErrorBox
}

module.exports = Wendy