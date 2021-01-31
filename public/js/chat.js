const socket = io()

const $messageForm = document.querySelector('#message-form');
const $messageInput = document.querySelector('#message');
const $locationButton = document.querySelector('#location');
const $messageSendBtn = document.querySelector('#send-btn');
const $messages = document.querySelector('#messages')

// templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;

// listens to all messages
socket.on('message', (msg) => {
    const html = Mustache.render($messageTemplate,{ message: msg.text, 
                                                    time: moment(msg.createdAt).format('hh:mm A')
                                                })

    $messages.insertAdjacentHTML('beforeend', html)
})

// listens to locations
socket.on('location', (location) => {
    const html = Mustache.render($locationTemplate, { location: location.text,
                                                    time: moment(Location.createdAt).format('hh:mm A')
                                                    })

    $messages.insertAdjacentHTML('beforeend', html)
})

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
