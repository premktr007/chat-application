const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')

const app = express()

/* express will create this behind the scences 
    but we wont have access to it. so have to create 
    new web server explicitly.
*/
const server = http.createServer(app)

// passing web server to socket
const io = socketio(server)

const port = process.env.port || 3000
const public_dir = path.join(__dirname, '../public')

// serving the public directory
app.use(express.static(public_dir))

io.on('connection', (socket) => {

    // welcome message
    socket.emit('message', 'Welcome')

    // sending messages
    socket.on('sendMessage', (message) => {
        io.emit('message',message)
    })

    // sending to every client except current client
    socket.broadcast.emit('message', 'A new user has joined !')

    // when client disconnected
    socket.on('disconnect', () => {
        // sending to every client
        io.emit('message', 'User has left')
    })

    // sending location
    socket.on('sendLocation', (coords) => {
        io.emit('message', `https://www.google.com/maps?q=${coords.lat},${coords.lon}`)
    })

})

// listening to the port
server.listen(port, () => {
    console.log(`server is up and running at port ${port}`)
})