const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/isRealString');
const {User} = require('./utils/users');

const publicPath = path.resolve(__dirname, "../public");
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);

let io = socketIO(server);

let users = new User();

app.use(express.static(publicPath));

io.on('connection', (socket) => {

    console.log("A user connected");

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !(isRealString(params.room))) {
            callback('Name and room are required.');
        }

        socket.join(params.room);

        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        // io.to().emit() will emit the event to all the sockets connected to the given room,
        // including the current socket that triggered the event.
        io.to(params.room).emit('updateUsersList', users.getUserList(params.room));

        // This will trigger the event to just the socket that triggered the event.
        socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room}`));;

        // This will trigger the event to all sockets except the socket that triggered the event.
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} Joined!!`));

        // Just to display no Error message as no parameters are passed.
        callback();
    });

    socket.on('createMessage', (msg, callback) => {
        let user = users.getUser(socket.id);

        if(user && isRealString(msg.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, msg.text));
        }
        callback('Created and Displayed the message');
    });

    socket.on('createLocationMessage', (coords, callback) => {
        let user = users.getUser(socket.id);
        if(user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        } else {
            callback('User not found');
        }
    });

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('updateUsersList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room`));
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});