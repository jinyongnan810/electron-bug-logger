import React from 'react'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import Moment from 'react-moment'

const LogItem = ({ log, delItem }) => {
    const setVariant = (priority) => {
        switch (priority) {
            case 'high': return 'danger'
            case 'moderate': return 'warning'
            case 'low': return 'success'
            default: return 'info'
        }
    }
    return (
        <tr>
            <td><Badge variant={setVariant(log.priority)} className='p-2'>{log.priority.charAt(0).toUpperCase() + log.priority.slice(1)}</Badge></td>
            <td>{log.text}</td>
            <td>{log.user}</td>
            <td><Moment format='LLLL'>{new Date(log.created)}</Moment></td>
            <td><Button variant="outline-danger" onClick={() => delItem(log._id)}>delete</Button></td>
        </tr>
    )
}


export default LogItem
