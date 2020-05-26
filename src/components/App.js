import React, { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Alert from 'react-bootstrap/Alert'
import LogItem from './LogItem'
import AddLogItem from './AddLogItem'
import { ipcRenderer } from 'electron'

const App = () => {
	// use state
	const [logs, setLogs] = useState([])
	const [alert, setAlert] = useState({
		show: false,
		message: '',
		variant: 'success'
	})

	// use effect
	useEffect(() => {// run when loaded
		// request load
		ipcRenderer.send('logs:load')
		// logs loaded
		ipcRenderer.on('logs:loaded', (e, logs) => {
			setLogs(JSON.parse(logs))
		})
		// logs cleared
		ipcRenderer.on('logs:cleared', () => {
			setLogs([])
			showAlert('Log Cleared!')
		})
	}, [])

	// add log
	const addItem = (item) => {
		if (!item.user || !item.text || !item.priority || item.priority == '0') {
			showAlert('Input not complete!', 'danger')
			return
		}
		ipcRenderer.send('logs:add', item)
		//setLogs([...logs, { ...item, _id: Math.floor(Math.random() * 90000) + 10000, created: new Date().toString() }])
		showAlert('Added Successfully!')
	}

	// delete log
	const delItem = id => {
		ipcRenderer.send('logs:delete', id)
		// setLogs(logs.filter(log => {
		// 	return log._id != id
		// }))
		showAlert('Deleted Successfully!')
	}

	// show alert
	const showAlert = (message, variant = 'success', disapearAfter = 3000) => {
		setAlert({ message, variant, show: true })
		setTimeout(() => {
			setAlert({ message: '', variant, show: false })
		}, disapearAfter);
	}

	return (
		<Container>
			<AddLogItem addItem={addItem} />
			{/* use of show */}
			{alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
			<Table>
				<thead>
					<tr>
						<th>Priority</th>
						<th>Log</th>
						<th>User</th>
						<th>Created</th>
						<th>Options</th>
					</tr>
				</thead>
				<tbody>
					{
						logs.map(log => (
							< LogItem key={log._id} log={log} delItem={delItem} />
						))
					}
				</tbody>
			</Table>
		</Container>
	)
}

export default App
