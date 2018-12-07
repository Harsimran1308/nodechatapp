const path = require('path');
const http = require('http');
const express = require('express');
const {isRealString} = require('./utils/validations');
const socketIO = require('socket.io');
const {generateMessage} = require('./utils/message');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));


io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join',(params,callback)=>{
    if(!isRealString(params.name) || !isRealString(params.room)){
      callback('Name and Room is required');
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id,params.name,params.room);
    io.to(params.room).emit('updateUserList',users.getUserList(params.room));
    socket.emit('newMessage',generateMessage('Admin:','Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin:',`${params.name} has joined`));
    callback();
  });
  socket.on('createMessage',(message,callback)=>{
    io.to(message.room).emit('newMessage',generateMessage(message.from,message.text));
    callback();
  });

  socket.on('somethingImp',(text)=>{
    console.log('Text',text);
  });

     
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if(user){
      io.to(user.room).emit('updateUserList',users.getUserList(user.room));
      io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left.`));
    }
  });
});

server.listen(3000, () => {
  console.log(`Server is up on 3000`);
});