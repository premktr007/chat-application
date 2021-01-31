const socket = io()

// listens to all messages
socket.on('message', (msg) => {
    console.log(msg)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    // preventing browser from reloading the page
    e.preventDefault()

    const message = document.querySelector('#message').value;

    socket.emit('sendMessage', message)
})

document.querySelector('#location').addEventListener('click', () => {

    if(!navigator.geolocation) {
        return alert('your browser does not support geolocation')
    }

    // getting the current location of the browser
    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendLocation',{ lat:position.coords.latitude, lon:position.coords.latitude})
    })
})
