const express = require('express')
require('./db/mongoose') // just to ensures that the mongoose file runs
const userRouter = require('./routers/user')
const skoutRouter = require('./routers/skout')
const instructionRouter = require('./routers/instruction')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(skoutRouter)
app.use(instructionRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})