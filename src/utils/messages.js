const generateMessage = (username, message, socketid="") => {
    return {
        username,
        text:message,
        socketid,
        createdAt: new Date().getTime()
    }
}

module.exports = { generateMessage }