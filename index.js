/**
 * Created by Marc on 05/07/2017.
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var myIP = require('my-ip');
var io = require('socket.io')(http);
var nickname;
var users_conn = [];
var id_user = [];
app.use(express.static(__dirname + '/client/static'));
app.get('/',function(req,res){
    res.sendFile(__dirname + '/client/index.html');
});
app.get('/chat',function(req,res){
    nickname = req.query['nick'];
    res.sendFile(__dirname + '/client/chat.html');
});
io.on('connection', function(socket){
    if(nickname != null) {
        socket.emit('id', nickname);
        //enviamos el nickname al html para que se acuerde y
        // envie todos los mensajes con el mismo id, guardamos el id en users_conn

        id_user[socket.id] = nickname; //guardamos el nickname de cada connexion para poder obtener el nick con el id del socket
        users_conn.push(nickname);
        socket.emit('users_conn', users_conn); //enviamos los usuarios actuales al nuevo user
        socket.broadcast.emit('add_user_conn', nickname); //añadimos un nuevo user connectado, lo enviamos a todos, menos el nuevo
        console.log(nickname + ' se ha conectado');
        socket.on('chat message', function (msg) {
            io.emit('chat message', msg);
            console.log('msg= ' + msg['nick'] + ' ' + msg['content']);
        });
        socket.on('disconnect', function () {
            io.emit('del_user_conn', id_user[socket.id]);
            var index = users_conn.indexOf(id_user[socket.id]);
            if(index >= 0) users_conn.splice(index,1);
            console.log(id_user[socket.id] + ' se ha desconectado');
            delete id_user[socket.id];
        });
    }else console.log('se ha conectado un no registrado');
});


http.listen(3000, function(){
   console.log('listening on ' + myIP() + ':3000');
});