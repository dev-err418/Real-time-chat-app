const io = require("socket.io")(3000);

console.log("Waiting for new connections...");

//  clients object which will stock all the users infos with that schema : {"uid": "name", "uid2": "name2", ...}
var clients = {};

//  if a socket is connected
io.on("connection", (socket) => {
  //  getting the uid of the current socket
  const socketId = socket.conn.id;
  console.log("New connection:", socketId);

  //  if a user send his name
  socket.on("name", (name) => {
    //  setting socket.name to the name previously sent
    socket.name = name;
    //  adding the uid and the name to the clients object
    clients[socketId] = name;
    console.log("New user:", name);
    //sending to all the users in the room the name of the new user to add it to the connected users. Except to the one who sent it
    socket.broadcast.emit("new", name);
  });

  //  if a user ask for all the user currently connected to the chat room
  socket.on("getAll", () => {
    //  sending to the client only the names of the users and not uid + name
    var listOfClients = [];
    for (let i = 0; i < Object.keys(clients).length; i++) {
      listOfClients.push(clients[Object.keys(clients)[i]]);
    }
    //  sending back the response only to the user who requests it
    socket.emit("getAll", listOfClients);
  });

  //  if a user send a message
  socket.on("msg", (msg) => {
    //  send the message to every one in the room except the sender
    socket.broadcast.emit("msg", msg);
  });

  //  if a user is disconnected
  socket.on("disconnect", () => {
    //  deleting the name of the user who is disconnected from the clients{} object
    const {
      name,
    } = socket;
    delete clients[socketId];
    console.log("User disconnected:", socketId, " : ", name);
    //  sending to all the user in the room that someone left to remove it from the currently connected users
    socket.broadcast.emit("out", name);
  });
});
