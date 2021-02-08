const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const badwords = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { getUser, removeUser, addUser, getUsersInRoom } = require('./utils/users')

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

    socket.on('join', ({ username, room}, status) => {
        const { error, user } =  addUser({id: socket.id, username, room})

        if (error) {
            return status(error)
        }
        socket.join(room)
         // welcome message
        socket.emit('message', generateMessage('Welcome!!'))

         // sending message to every client in that room except current client
        socket.broadcast.to(room).emit('message', generateMessage('Admin', `${user.username} has joined !`))

        // emiting group users data
        io.to(user.room).emit('users', { room: user.room, users: getUsersInRoom(user.room)})
    })

    // sending messages
    socket.on('sendMessage', (message, status) => {
        const filter = new badwords()
        const user = getUser(socket.id)

        if(filter.isProfane(message)) {
            status('profanity')
            return io.to(user.room).emit('message', generateMessage(user.username, filter.clean(message), socket.id))
        } 
        io.to(user.room).emit('message', generateMessage(user.username, message, socket.id))
        // callback acknowledge
        status('Message Delivered')

    })

    socket.on('typing', () => {
        const user = getUser(socket.id)

        if(user) {
            socket.broadcast.to(user.room).emit('usertyping', ` ${user.username} is typing...`)
        }
    })

    // sending location
    socket.on('sendLocation', (coords,status) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('location', generateMessage(user.username, `https://www.google.com/maps?q=${coords.lat},${coords.lon}`, socket.id))
        status('Location Shared')
    })

    // when client disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        // sending to every client
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', ` ${user.username} has left`))
            // emiting group users data
            io.to(user.room).emit('users', { room: user.room, users: getUsersInRoom(user.room)})
        }
    })

})

// listening to the port
server.listen(port, () => {
    console.log(`server is up and running at port ${port}`)
})