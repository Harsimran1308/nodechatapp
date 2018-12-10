/* MODULE IMPORTS */
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../public');
const http = require('http');
const {Users} = require('./users');


/* CREATING SERVER */
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

/* CREATING USER OBJECT  */
var users = new Users();

/* MIDDLEWARE */
app.use(express.static(publicPath));


/* CREATING CONNECTION */
io.on('connection', (socket) => {

  /* WILL TRIGGER WHEN NEW USER JOINS
      SECOND PARAMETER CONTAINS NAME AND ROOM OF USER JOINED
      Callback to send ERROR IF NAME AND ROOM IS EMPTY 
   */
  socket.on('join',(params,callback)=>{
    /* VALIDATION FOR USER NAME AND ROOM  */
    if(!isRealString(params.name) || !isRealString(params.room)){
      callback('Name and Room is required');
    }
    socket.join(params.room);     /* USER WILL JOINED FOR SAME ROOM */
    users.addUser(socket.id,params.name,params.room);       /* STORING USER WITH ITS DETAILS */
    io.to(params.room).emit('updateUserList',users.getUserList(params.room));    /* SENDING USER LIST OF ONLINE USERS */
    socket.emit('newMessage',generateMessage('Admin:','Welcome to the chat app'));   /* GREETING SAME USER */
    socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin:',`${params.name} has joined`));  /* SENDING OTHER USER IN THAT ROOM THAT NEW USER HAS JOINED */
    callback();
  });

  /* WILL TRIGGER WHEN NEW MESSAGE COMES */
  socket.on('createMessage',(message,callback)=>{
    io.to(message.room).emit('newMessage',generateMessage(message.from,message.text));
    callback();
  });
     
  /* WILL TRIGGER WHEN USER LOGGED OUT 
    FUNCTION WILL REMOVE USER FROM THAT ROOM AND UPDATE LIST OF ALL OTHER USERS IN THAT ROOM
    */
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if(user){
      io.to(user.room).emit('updateUserList',users.getUserList(user.room));
      io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left.`));  /* MESSAGE TO OTHER USERS THAT SOME USER HAS LEFT */
    }
  });
});

/* STARTING THE SERVER */
server.listen(3000, () => {
  console.log(`The Site Is Live on "Localhost:3000"`);
});


/* FUNCTION FOR GENERATING THE MESSAGE */
var generateMessage = (from,text)=>{
  return {
      from,
      text,
      createdAt:new Date().getTime()
  }
}

/* SERVER SIDE VALIDATION */
var isRealString = (str)=>{
  return typeof str === 'string' && str.trim().length > 0;
}