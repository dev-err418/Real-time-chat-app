var io = require("socket.io-client");
var blessed = require("blessed");
const prompt = require("prompt-sync")({
  //  without it you can't exit the textinput by pressing "ctrl" + "c"
  sigint: true,
});

console.log("Connecting ...");

//  connecting to the web sockets server
var socket = io("http://192.168.0.121:3000/");
var name = "";

//  sleep function as the time.sleep(x) in python
sleep = (ms) => {
  const date = Date.now();
  let currDate = null;
  do {
    currDate = Date.now();
  } while (currDate - date < ms);
};

//  if current user is connected
socket.on("connect", async () => {
  console.log("Connected");
  //  asking in the shell the name and waiting an answer (no error handling if empty...)
  name = await prompt("What's your name ? ");
  //  send to the server the current user's name to add it to the user object
  socket.emit("name", name);
  console.log(`Welcome to the chat ${name}.`);
  sleep(1000);

  //  request to the server all connected users
  socket.emit("getAll");

  //  function to send messages
  const sendNewMess = (content, date) => {
    socket.emit("msg", {
      "body": content.replace("\n", ""),
      "from": name,
      "time": date,
    });
  };

  //  if receiving a message from the server handle it in this function
  socket.on("msg", (msg) => {
    const {
      body,
      from,
      time,
    } = msg;
    //  calculate hours/minutes/seconds from the time string
    const date = new Date(time);
    const h = date.getHours().toString();
    const m = date.getMinutes().toString();
    const s = date.getSeconds().toString();
    const hms = new String(h + ":" + m + ":" + s);
    const message = "> " + hms + "  " + from + " : " + body;
    newMess(message.toString());
    newMess("");
  });

  //  if current user is disconnected (ex: server shuted down or shell closed)
  socket.on("disconnect", () => {
    //  exit from the program if the current user is disconnected
    process.exit(1);
  });

  //  GUI
  const screen = blessed.screen({
    smartCSR: true,
    title: "Chat app",
  });

  var userInfosContent =
    `Exit => double click on escape. You're name: ${name}. \n Connected users:`;

  //  Showing the user name and how to exit from the chat
  var userInfos = blessed.box({
    align: "center",
    mouse: false,
    keys: false,
    top: 0,
    right: 0,
    height: 4,
    width: 30,
    content: userInfosContent,
    padding: {
      top: 1,
    },
    style: {
      fg: "blue",
    },
  });

  //  showing all the connected users
  var otherUsers = blessed.list({
    align: "center",
    mouse: true,
    keys: true,
    width: "150",
    height: "300",
    top: 5,
    right: 0,
    items: [],
    padding: {
      right: 0,
      top: 0,
    },
  });

  //  if server sent back all the users signed in
  socket.on("getAll", (userNames) => {
    for (var i = 0; i < userNames.length; i++) {
      otherUsers.addItem(userNames[i]);
      screen.render();
    }
  });

  //  if the server sent back a new user connected to that chat room
  socket.on("new", (userNames) => {
    otherUsers.addItem(userNames);
    screen.render();
  });

  //  if one of the user in the room lives it
  socket.on("out", (userName) => {
    otherUsers.removeItem(userName);
    otherUsers.scrollTo(100);
    screen.render();
  });

  //  showing all the messages
  var messageList = blessed.list({
    align: "left",
    mouse: true,
    keys: true,
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    scrollbar: {
      ch: " ",
      inverse: true,
    },
    items: [],
    padding: {
      left: 4,
      top: 4,
    },
  });

  //  showing the text input at the bottom of the shell
  var input = blessed.textarea({
    bottom: 1,
    left: "center",
    height: "10%",
    width: "94%",
    inputOnFocus: true,
    padding: {
      top: 1,
      left: 2,
    },

    style: {
      fg: "#787878",
      bg: "#5c5c3d",

      focus: {
        fg: "#f6f6f6",
        bg: "#5c5c3d",
      },
    },
  });

  // function to add a new message on the messages list
  const newMess = (mess) => {
    messageList.addItem(mess);
    messageList.scrollTo(100);
    screen.render();
  };

  //  if the user click on enter (after have filled the field to send it to the server)
  input.key("enter", async function () {
    //   getting the value of the text input
    var message = this.getValue();
    //  setting the timestamps for the messages
    const date = new Date();
    const h = date.getHours().toString();
    const m = date.getMinutes().toString();
    const s = date.getSeconds().toString();
    const hms = new String(h + ":" + m + ":" + s);
    //  creating the message with : "time" "name of the sender" "content of the message"
    const msg = "> " + hms + "  " + "You" + " : " + message;
    //  if the input field is empty, do nothing
    if (String(message).length > 1) {
      //  adding the message in the GUI through the newMess() function
      newMess(msg.toString());
      //  back to line => /n
      newMess("");
      //  sending the message to the server  through rge sendNewMess() function
      sendNewMess(message, date);
    }
    //  rendering
    this.clearValue();
    screen.render();
  });

  //  if the user presses the following key, he will be exited from the program
  //  (you'll have to click twice because one for exiting the text field and the other for exiting the hole application)
  screen.key(["escape"], () => {
    return process.exit(0);
  });

  //  rendering of the GUI
  screen.append(messageList);
  screen.append(userInfos);
  screen.append(otherUsers);
  screen.append(input);
  input.focus();
  screen.render();
});
