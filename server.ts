import './env.js'
import express from 'express'

import suggest from './api/suggest.js'
import events from './api/events.js'
import status from './api/status.js'
import goalsParse from './api/goals/parse.js'
import momentum from './api/momentum.js'
import history from './api/history.js'

const app = express()
app.use(express.json())

const wrap = (handler: Function) => (req: express.Request, res: express.Response) => handler(req, res)

app.get('/api/suggest', wrap(suggest))
app.post('/api/events', wrap(events))
app.get('/api/status', wrap(status))
app.post('/api/goals/parse', wrap(goalsParse))
app.get('/api/momentum', wrap(momentum))
app.get('/api/history', wrap(history))

app.listen(3001, () => console.log('API server running on http://localhost:3001'))
