const socket = io()

const $messageForm = document.querySelector('#message-form');
const $messageInput = document.querySelector('#message');
const $locationButton = document.querySelector('#location');
const $messageSendBtn = document.querySelector('#send-btn');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
const $userTyping = document.querySelector('#user-typing');

// templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;
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

// listens to all messages
socket.on('message', (msg) => {
    const html = Mustache.render($messageTemplate,{ message: msg.text, 
                                                    time: moment(msg.createdAt).format('hh:mm A'),
                                                    username: msg.username
                                                })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// listens to locations
socket.on('location', (location) => {
    const html = Mustache.render($locationTemplate, { location: location.text,
                                                    time: moment(Location.createdAt).format('hh:mm A'),
                                                    username: location.username
                                                    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('users', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, { room: room, users: users })
    $sidebar.innerHTML = html
})

// sending messages
$messageForm.addEventListener('submit', (e) => {
    // preventing browser from reloading the page
    e.preventDefault()

    const message = $messageInput.value
    
    $messageSendBtn.setAttribute('disable', 'true')

    socket.emit('sendMessage', message, (status) => {
        if(status) {
            console.log(status)
            $messageSendBtn.setAttribute('disable', 'false')
            $messageInput.value = ''
            $messageInput.focus()
        }
    })
})

// user typing feature
$messageInput.addEventListener('keydown', () => {
    socket.emit('typing')
    socket.on('usertyping', (message) => {
        $userTyping.textContent = message;
        setTimeout(userNotTyping, 500)
    })
    
})

// when user not typing
const userNotTyping = () => {
    $userTyping.textContent = ""
}

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

socket.emit('join', { username, room}, (status) => {
    if (status) {
        alert(status)
        window.location.href = '/'
    }
})