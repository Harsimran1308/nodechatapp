var socket = io();
var params;
            function scrollToBottom(){
                var messages = jQuery('#messages');
                var newMessage = messages.children('li:last-child');
                var clientHeight = messages.prop('clientHeight');
                var scrollTop = messages.prop('scrollTop');
                var scrollHeight = messages.prop('scrollHeight');
                var newMessageHeight = newMessage.innerHeight();
                var lastMessageHeight = newMessage.prev().innerHeight();

                if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
                    console.log('scroll down');
                }
            }
            socket.on('connect',function(){
                params = jQuery.deparam(window.location.search);
               socket.emit('join',params,function(err){
                    if(err){
                        alert(err);
                        window.location.href = '/';
                    }
                    else{
                        console.log('No error');
                    }
               });


            });

            socket.on('disconnect',function(){
                console.log('disconnected from server');
            });

            socket.on('updateUserList',function(users){
                var ol = jQuery('<ul></ul>');

                users.forEach(function(user){
                    var li=jQuery('<li></li>');
                    var span=jQuery('<span class="dot"></span>');
                    li.append(span);
                    var value=user;
                    li.append(document.createTextNode(value));
                    ol.append(li);
                })

                jQuery('#users').html(ol);
            });
            
            socket.on('newMessage',function(message){
                var formattedTime = moment(message.createdAt).format('h:mm a');
                var toset_id;
                if(message.from == "Admin:" || message.from == "Admin") {
                    toset_id = "admin";
                }
                else if(message.from == params.name) {
                    toset_id = "ownuser";
                }
                else {
                    toset_id = "friend";
                } 
                // var template = jQuery('#message-template').html();
                var li=jQuery('<li></li>');
                li.attr("class","message");
                li.attr("id",toset_id);
                var div_from=jQuery('<div></div>');
                div_from.attr("class","message__title");
                var h4=jQuery('<h4></h4>').text(message.from);
                h4.attr('id','show');
                var span=jQuery('<span></span>').text(formattedTime);
                span.attr('id','show');
                var div_text=jQuery('<div></div>');
                div_text.attr("class","message__body");
                var p=jQuery('<p></p>').text(message.text);
                div_text.append(p);
                div_from.append(h4);
                div_from.append(span);
                li.append(div_from);
                li.append(div_text);
               
                // var html
                // var html = Mustache.render(template, {
                //   text: message.text,
                //   from: message.from,
                //   createdAt: formattedTime
                // });
                jQuery('#messages').append(li);
                scrollToBottom();
            });
            socket.on('newEmail',function(email){
                console.log('new Email',email);
            });

jQuery('#message-form').on('submit',function(e) {
    e.preventDefault();
    var messageTextBox = jQuery('[name=message]');
    var message = jQuery.deparam(window.location.search);
    socket.emit('createMessage',{
        room:message.room,
        from:message.name,
        text:messageTextBox.val()
    },function(){
        messageTextBox.val('')
    });
});
