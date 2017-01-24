const EventEmitter = new (require('events').EventEmitter)()
const {dialog} = require('electron')
const winmanager = require('electron-window')

let  Wendy = {
  get windows() {
    return winmanager.windows;
  },

  emitter: EventEmitter,

  on (evName, callback) {
    this.emitter.on(evName, callback)
    return this
  },

  off (evName, handler) {
    this.emitter.removeListener(evName, handler)
    return this
  },

  emit (evName, options) {
    let data, target, sourceWin

    if (options !== undefined && options !== null && typeof options === 'object') {
      data = options.data;
      target = options.target;
      sourceWin = options.emittedBy;
    }
    this.emitter.emit(evName, {
      emittedBy: this.getName(sourceWin),
      target,
      data,
      name: evName
    })
    return this
  },

  create(name, options) {
    if (typeof name !== 'string') {
      options = name
      name = null
    }
    let win = winmanager.createWindow(options);
    if (name) {
      win.winName = name
    }
    return win
  },

  getName (win) {
    let res = winmanager.windows[Object.keys(winmanager.windows).find(key => {
        return winmanager.windows[key] === win
    })]
    return res ? res.winName : null
  },

  getByName (name) {
    return winmanager.windows[Object.keys(winmanager.windows).find(key => {
        return winmanager.windows[key].winName === name
    })] || null
  },

  getById (id) {
    return winmanager.windows[id] || null
  },

  has(name) {
    return this.getByName(name) ? true : false;
  },

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