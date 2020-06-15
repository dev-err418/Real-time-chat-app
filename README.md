# Real-time-chat-app :rocket:

Real time chat application with nodejs. Works with WebSockets.

Do you want to have your own chat application ? This project is for you ! 
The GUI is in the terminal to make it simple but you could do it with React, React-Native, Angular, Vue or anything you want to. :iphone:

In this chat app, you have two parts : the server and the clients.

## How to use it ?


Be sure to have node install on your computer by running : ```node -V ```.
 If you have a version output, everything's good ! If not follow the installation part on the [nodejs github page](https://github.com/nodejs/node).

First clone the repository: ```git clone https://github.com/arthur-spa/Real-time-chat-app.git ```

Then install the npm packages.
For the client, we will be using :
- socket.io-client (the WebSocket client), 
- blessed (the shell GUI) 
- prompt-sync (to interact with the user).

For the server only one package : socket.io (the Web Socket server).

In one command : ```npm i --save socket.io-client blessed prompt-sync socket.io```

To run the server, run : ```node server.js```

To run the client (open a new terminal), run : ```node client.js```.
You can have as many clients (shells) as you want. Great no ???

## How does it work ?

### The server

The server is listening on port **3000**. ```const io = require("socket.io")(3000);```. If you change the port here, think to change it on the client side.

Then, it's a really simple socket.io configuration. 
```
io.on("connection", (socket) => {

  socket.on("name", (name) => { ... });
  
  socket.on("getAll", () => { ... });

  socket.on("msg", (msg) => { ... });

  socket.on("disconnect", () => { ... });
});
```
As you see, the server is pretty simple.

### The client

The client is connecting on port **3000** (previously setted in the server). ```var socket = io("http://192.168.0.121:3000/");```

The socket.io client side is, as the server, pretty simple. 
```
socket.on("connect", async () => {

  socket.emit("name", name);

  socket.emit("getAll");

  socket.on("msg", (msg) => { ... });

  socket.on("disconnect", () => { ... });
  
  socket.on("getAll", (userNames) => { ... });

  socket.on("new", (userNames) => { ... });

  socket.on("out", (userName) => { ... });
  
});
```
The rendering part is with the npm package blessed. Blessed allows us to buil a GUI in the terminal. It's a bit like CSS for the "designing" part.

#### Hope this project helps or inspires you. Feel free to use and modify the code. Feel free too, to post a request for any optimisations ! 

##### Happy coding ! :rocket: 
