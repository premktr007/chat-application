const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const badwords = require('bad-words')
const { generateMessage } = require('./utils/messages')

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
    socket.emit('message', generateMessage('Welcome!!'))

    // sending messages
    socket.on('sendMessage', (message, status) => {
        const filter = new badwords()
        
        if(filter.isProfane(message)) {
            status('Profanity is not encouraged!!')
            return io.emit('message',filter.clean(message))
        } 
        io.emit('message',generateMessage(message))
        // callback acknowledge
        status('Message Delivered')

    })

    // sending to every client except current client
    socket.broadcast.emit('message', generateMessage('A new user has joined !'))

    // sending location
    socket.on('sendLocation', (coords,status) => {
        io.emit('location', generateMessage(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`))
        status('Location Shared')
    })

    // when client disconnected
    socket.on('disconnect', () => {
        // sending to every client
        io.emit('message', generateMessage('User has left'))
    })

})

// listening to the port
server.listen(port, () => {
    console.log(`server is up and running at port ${port}`)
})