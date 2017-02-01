const {app, BrowserWindow} = require('electron')
const path = require('path')

const Wendy = require('../index')

// prevent window being garbage collected
let win1, win2, win3, winUnamed, winTest, mod

function createMainWindow(name) {
  const win = Wendy.create(name,{width: 600, height:400})
  win.showUrl(path.join(__dirname,'test.html'), {index: name.split(' ')[1]}, ()=>{})
  console.log(`new window created with index: ${win.id} and name: ${win.winName}`)

  return win;
}

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  win1 = createMainWindow('win 1')
  win2 = createMainWindow('win 2')
  win3 = createMainWindow('win 3')
  winUnamed = Wendy.create()
  winUnamed.showUrl(path.join(__dirname,'test.html'), {index: 'unamed'}, ()=>{})
  console.log(`app get window by id of 'win 2' => ${Wendy.getById(win2.id).winName}`)
  console.log(`app has window 'win 2' ? => ${Wendy.has('win 2')}`)
  console.log(`app has window 'inexistant' ? => ${Wendy.has('inexistant')}`)

  console.log(`get window 'win 1' => ${Wendy.getByName('win 1').winName}`)
  console.log(`get window 'inexistant' => ${Wendy.getByName('inexistant')}`)

  console.log(`app has window 'test' ? => ${Wendy.has('test')}`)
  console.log("addind window 'test'")
  winTest = new BrowserWindow({
    width: 600,
    height: 400
  });
  winTest.loadURL(`file://${__dirname}/test.html`)
  Wendy.add(winTest, 'test')
  console.log(`app has window 'test' ? => ${Wendy.has('test')}`)

  // Keep reference to handler to remove it later on. 
  function handler (event) {
    console.log(`${event.name} / ${event.data} / ${event.target} / ${Wendy.getName(event.emittedBy)}`)
  };
  
  // Registering listener. 
  Wendy.on('my-event', handler)
});