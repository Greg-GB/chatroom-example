'use strict';

function join(socket, room) {
    if(!socket.checkRoomForId(room, socket.id)) {
        socket.join(room);
        socket.emit('welcome', {msg: `Welcome to the ${room} room!`});

        this.io.in(room).emit('joined', {msg: `${socket.user} joined!`});
    }
}

function leave(socket, room) {
    // Check if the user is in the room to leave.
    if(socket.checkRoomForId(room, socket.id)) {
        socket.leave(room);

        this.io.in(room).emit('left', {msg: `${socket.user} left!`});
    }
}

function message(socket, data) {
    // Check if the user is in the room to send a message.
    if (socket.checkRoomForId(data.chatRoom, socket.id)) {
        data.user = socket.user;
        let MessageModel = this.message.getModel();
        let message = new MessageModel(data);

        message.save()
            .then(res => this.io.in(data.chatRoom).emit('newMessage', data));
    }
}

function error(socket, err) {
    // Do something with error
    console.log(err);
}

function authenticate(socket, data) {
    // This is just an example... Do some real auth here. Cookies, Headers, JWT, etc
    if (data.user) {
        socket.user = data.user;
        socket.authenticated = true;
    }
}

module.exports = {
    join: join,
    leave: leave,
    message: message,
    error: error,
    authenticate: authenticate
};