const users = []


const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validating the data
    if (!username && !room) {
        return {
            error: 'Username and Room is required'
        }
    }

    // checking for duplicate user
    const isExisting = users.find(user => {
        return user.room ==  room && user.username == username
    })

    // validating username
    if(isExisting) {
        return {
            error: 'Username is already taken'
        }
    }

    // storing the user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id == id )

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {

    return users.find(user => user.id == id)
}

const getUsersInRoom = (room) => {
    
    return users.filter(user => user.room == room)
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom }