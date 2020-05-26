const path = require('path')
const url = require('url')
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const connectDB = require('./config/db')
const Log = require('./models/Log')

// connect to mongo
connectDB()

let mainWindow

let isDev = false
const isMac = process.platform === 'darwin' ? true : false

if (
	process.env.NODE_ENV !== undefined &&
	process.env.NODE_ENV === 'development'
) {
	isDev = true
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 800,
		show: false,
		icon: `${__dirname}/assets/icons/icon.png`,
		backgroundColor: 'white',
		webPreferences: {
			nodeIntegration: true,
		},
	})

	let indexPath

	if (isDev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			pathname: 'index.html',
			slashes: true,
		})
	} else {
		indexPath = url.format({
			protocol: 'file:',
			pathname: path.join(__dirname, 'dist', 'index.html'),
			slashes: true,
		})
	}

	mainWindow.loadURL(indexPath)

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()

		// Open devtools if dev
		if (isDev) {
			const {
				default: installExtension,
				REACT_DEVELOPER_TOOLS,
			} = require('electron-devtools-installer')

			installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
				console.log('Error loading React DevTools: ', err)
			)
			//mainWindow.webContents.openDevTools()
		}
	})

	// menu
	const mainMenu = Menu.buildFromTemplate(menu)
	Menu.setApplicationMenu(mainMenu)

	mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createMainWindow)

const menu = [
	...(isMac ? [{ role: 'appMenu' }] : []),
	{
		role: 'fileMenu',
	},
	{
		label: 'Logs',
		submenu: [
			{
				label: 'Clear all logs',
				click: () => clearLogs()
			},
		]
	},
	...(isDev
		? [
			{
				label: 'Developer',
				submenu: [
					{ role: 'reload' },
					{ role: 'forcereload' },
					{ type: 'separator' },
					{ role: 'toggledevtools' },
				],
			},
		]
		: []),
]

// process load request
ipcMain.on('logs:load', () => {
	sendLogs()
})
// process add request
ipcMain.on('logs:add', async (e, item) => {
	try {
		await Log.create(item)
		sendLogs()
	} catch (error) {
		console.log(error)
	}
})
//process delete request
ipcMain.on('logs:delete', async (e, id) => {
	try {
		await Log.findByIdAndDelete({ _id: id })
		sendLogs()
	} catch (error) {
		console.log(error)
	}
})
// clear logs
const clearLogs = async () => {
	try {
		await Log.deleteMany({})
		mainWindow.webContents.send('logs:cleared')
	} catch (error) {
		console.log(error)
	}
}

const sendLogs = async () => {
	try {
		const logs = await Log.find().sort({ created: 1 })//sort by date asc
		mainWindow.webContents.send('logs:loaded', JSON.stringify(logs))
	} catch (error) {
		console.log(error)
	}
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow()
	}
})

// Stop error
app.allowRendererProcessReuse = true
