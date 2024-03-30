let socket = io();
socket.on('connect', function () {
    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');
    socket.emit('join', params, function (error) {
        if (error) {
            alert(error);
            window.location.href = '/';
        } else {
            console.log("no Error");
        }
    });
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('updateUsersList', function (users) {
    let ol = document.createElement('ol');

    users.forEach(function (user) {
        let li = document.createElement('li');
        li.innerHTML = user;
        ol.appendChild(li);
    });

    let usersList = document.querySelector('#users');
    usersList.innerHTML = '';
    usersList.appendChild(ol);
});

socket.on('newMessage', function (msg) {
    const formattedTime = moment(msg.createdAt).format('LT');
    let li = document.createElement('li');
    li.innerHTML = `${msg.from}: ${formattedTime}: ${msg.text}`;

    document.querySelector('body').appendChild(li);
});


socket.on('newLocationMessage', function (msg) {
    console.log('New Location Message:', msg);
    const formattedTime = moment(msg.createdAt).format('LT');
    let li = document.createElement('li');

    // 1.
    // li.innerHTML = `<a href="${msg.url}">${msg.from} shared location</a>`;
    
    // 2.
    let a= document.createElement('a');
    a.setAttribute('target', '_blank');
    a.setAttribute('href', msg.url);
    a.innerHTML = `${msg.from} ${formattedTime}`;
    li.appendChild(a);
    document.querySelector('body').appendChild(li);
});


document.querySelector('#submit-btn').addEventListener('click', function(e) {
    e.preventDefault();

    socket.emit('createMessage', {
        text: document.querySelector('input[name="message"]').value
    }, function(message) {
        console.log('Got the message from the server.', message);
    });
});

document.querySelector('#send-location').addEventListener('click', function(e) {
    if(!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function(message) {
        alert('Unable to fetch location. ' + message);
    });
});