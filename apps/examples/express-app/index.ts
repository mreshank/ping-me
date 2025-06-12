import express from 'express'
import { withPingMe } from '@ping-me/express'

const app = express()
withPingMe(app, { log: true })

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})