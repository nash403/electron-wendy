const eventEmitter = new (require('events').EventEmitter)()
const {dialog} = require('electron')
const winmanager = require('electron-window')

let  Wendy = {
  get windows() {
    return winmanager.windows;
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