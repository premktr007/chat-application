const express = require('express')
const app = express()
const path = require('path')


const port = process.env.port || 3000
const public_dir = path.join(__dirname, '../public')

// serving the public directory
app.use(express.static(public_dir))

// listening to the port
app.listen(port, () => {
    console.log(`server is up and running at port ${port}`)
})