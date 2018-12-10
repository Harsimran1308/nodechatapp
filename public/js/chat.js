var socket = io();
var params;
            /* FUNCTION TO SEE IF SCROLL DOWN IS REQUIRED */
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
            /* WILL TRIGGER WHEN USER LOGS IN  */
            socket.on('connect',function(){
                params = jQuery.deparam(window.location.search);     /* DEPARAMS IS USED TO FETCH DETAILS IN URL */
                /* SENDING DETAILS TO SERVER 
                    IF ERROR OCCURS ALERT WILL BE SHOWN NAVIGATE BACK TO LOG IN PAGE
                */
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

            /* WILL TRIGGER WHEN USER LOGS OUT */
            socket.on('disconnect',function(){
                console.log('disconnected from server');
            });

            /* WILL BE TRIGGERED BY SERVER TO UPDATE LIST OF ONLINE USER */
            socket.on('updateUserList',function(users){
                var ol = jQuery('<ul></ul>');

                /* LOOP FOR CREATING ONLINE USERS */
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
            
            /* WILL BE TRIGGERED BY SERVER FOR NEW MESSAGE */
            socket.on('newMessage',function(message){
                var formattedTime = moment(message.createdAt).format('h:mm a');
                var toset_id;
                /* CONDITION TO SEE WHETHER NEW MESSAGE IS FROM ADMIN USERONLINE OR SAME USER  */
                if(message.from == "Admin:" || message.from == "Admin") {
                    toset_id = "admin";
                }
                else if(message.from == params.name) {
                    toset_id = "ownuser";
                }
                else {
                    toset_id = "friend";
                } 
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
                jQuery('#messages').append(li);
                scrollToBottom();
            });

/* WILL TRIGGERED ON CLICK OF SEND BUTTON BY USER 
   SENDING USER MESSAGE TO SERVER WITH USER NAME,ROOM AND MESSAGE */
jQuery('#message-form').on('submit',function(e) {
    e.preventDefault();
    var messageTextBox = jQuery('[name=message]');
    var message = jQuery.deparam(window.location.search);
    socket.emit('createMessage',{
        room:message.room,
        from:message.name,
        text:messageTextBox.val()
    },function(){
        messageTextBox.val('')     /* SETTING TEXT BOX TO EMPTY WHEN MESSAGE IS SEND */
    });
});
