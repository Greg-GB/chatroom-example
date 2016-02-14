const Message = require('../models/message');

module.exports = (io) => {
    const defaultChatRoom = 'default';

    io.on('connect', (socket) => {
        socket.emit('welcome', {msg: 'Welcome!'});
        socket.join(defaultChatRoom);

        socket.on('join', (data) => {
            data.chatRoom = data.chatRoom || defaultChatRoom
            socket.join(data.chatRoom);
            io.in(data.chatRoom).emit('joined', {msg: data.user + ' joined!'});
        });

        socket.on('msg', (data) => {
            data.chatRoom = data.chatRoom || defaultChatRoom
            var message = new Message(data);
            message.save()
                .then(io.in(data.chatRoom).emit('chatMsg', data));
        });

        socket.on('leave', (data) => {
            data.chatRoom = data.chatRoom || defaultChatRoom
            socket.leave(data.chatRoom);
            io.in(data.chatRoom).emit('left', {msg: data.user + ' left!'});
        });
  });
}
