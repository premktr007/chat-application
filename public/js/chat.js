const socket = io()

const $messageForm = document.querySelector('#message-form');
const $messageInput = document.querySelector('#message-input');
const $locationButton = document.querySelector('#location');
const $messageSendBtn = document.querySelector('#send-btn');
const $messages = document.querySelector('#messages');
const $userMessage = document.getElementsByClassName('message');
const $sidebar = document.querySelector('#sidebar');
const $userTyping = document.querySelector('#user-typing');

// templates
const $RHSmessageTemplate = document.querySelector('#RHS-message-template').innerHTML;
const $LHSmessageTemplate = document.querySelector('#LHS-message-template').innerHTML;
const $RHSlocationTemplate = document.querySelector('#RHS-location-template').innerHTML;
const $LHSlocationTemplate = document.querySelector('#LHS-location-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// gets the username and room to an object from query params
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// joining the user to the room
socket.emit('join', { username, room}, (status) => {
    if (status) {
        alert(status)
        window.location.href = '/'
    }
})

// listing the users of the room
socket.on('users', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, { room: room, users: users })
    $sidebar.innerHTML = html
})

// when user not typing
const userNotTyping = () => {
    $userTyping.textContent = ""
}

// user typing feature
$messageInput.addEventListener('keydown', () => {
    socket.emit('typing')
    socket.on('usertyping', (message) => {
        $userTyping.textContent = message;
        setTimeout(userNotTyping, 500)
    })
    
})

// listens to all messages
socket.on('message', (msg) => {

    // render message RHS
    if(socket.id == msg.socketid) {
        var html = Mustache.render($RHSmessageTemplate,{ message: msg.text, 
            time: moment(msg.createdAt).format('hh:mm A'),
            username: msg.username
        })
    }
    else { // render message LHS
        var html = Mustache.render($LHSmessageTemplate,{ message: msg.text, 
            time: moment(msg.createdAt).format('hh:mm A'),
            username: msg.username
        })
    }

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// sending messages
$messageForm.addEventListener('submit', (e) => {
    // preventing browser from reloading the page
    e.preventDefault()

    const message = $messageInput.value
    
    $messageSendBtn.setAttribute('disable', 'true')

    socket.emit('sendMessage', message, (status) => {
        if(status) {
            if (status=='profanity') {
                alert('Profanity is not encouraged')
            }
            $messageSendBtn.setAttribute('disable', 'false')
            $messageInput.value = ''
            $messageInput.focus()
        }
    })
})

// listens to locations
socket.on('location', (location) => {
    if(socket.id == location.socketid) { 
        var html = Mustache.render($RHSlocationTemplate, { location: location.text,
                                                        time: moment(Location.createdAt).format('hh:mm A'),
                                                        })
    }
    else {
        var html = Mustache.render($LHSlocationTemplate, { location: location.text,
                                                        time: moment(Location.createdAt).format('hh:mm A'),
                                                        username: location.username
                                                        })
    }
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// sending locations
$locationButton.addEventListener('click', () => {

    if(!navigator.geolocation) {
        return alert('your browser does not support geolocation')
    }

    // getting the current location of the browser
    navigator.geolocation.getCurrentPosition( (position) => {

        $locationButton.setAttribute('disable', 'true')

        socket.emit('sendLocation',{ lat:position.coords.latitude, lon:position.coords.latitude }, (status) => {
            if (status) {
                $locationButton.setAttribute('disable', 'false')
            }
            
        })
    })
})
