require("dotenv").config();
var express = require("express");
var app = express();
const http = require("http");
const WebSocket = require("ws");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var jwt = require("jwt-simple");

var apiport = process.env.apiport;
var mongouri = process.env.mongouri;
var tokenKey = process.env.tokenkey;

const User = require("./models/tbluser");
const ChatHistory = require("./models/tblchathistory");

const server = http.createServer(app);

// Websocket Instance
const wss = new WebSocket.Server({ server });

let users = {};

const sendTo = (connection, message) => {
    connection.send(JSON.stringify(message));
};

const sendToAll = (clients, type, { id, userid: userName }) => {
    Object.values(clients).forEach(client => {
        if (client.userid !== userName) {
            client.send(
                JSON.stringify({
                    type,
                    user: { id, userName }
                })
            );
        }
    });
};

wss.on("connection", ws => {
    ws.on("message", msg => {
        let data;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
        }
        const { type, userid, senderid, receiverid, message } = data;
        switch (type) {
            case "login":
                User.findOne({
                    id: userid
                }).then((response) => {
                    if (response != null) {
                        const loggedIn = Object.values(
                            users
                        ).map(({ id, userid: userName }) => ({ id, userName }));
                        users[userid] = ws;
                        ws.userid = userid;
                        ws.id = userid;
                        sendTo(ws, {
                            type: "login",
                            success: true,
                            users: loggedIn
                        });
                        sendToAll(users, "updateUsers", ws);
                    }
                });
                break;
            case "chat":
                var obj = new Object();
                obj.senderid = senderid;
                obj.receiverid = receiverid;
                obj.message = jwt.encode(message, tokenKey);
                ChatHistory.create(obj).then((messageRes) => {
                    const recieverUser = users[receiverid];
                    sendTo(recieverUser, {
                        message,
                        receiverid: receiverid
                    });
                });
                break;
            default:
                sendTo(ws, {
                    type: "error",
                    message: "Command not found: " + type
                });
                break;
        }
    });
    ws.on("close", () => {
        delete users[ws.userid];
        sendToAll(users, "leave", ws);
    });
});

// DB Connection
let db = mongoose.connect(mongouri, {
    useNewUrlParser: true,
    useCreateIndex: true
});

app.use(express.static(__dirname + "/"));
app.use("/chat", require("./controllers/chat"));

server.listen(apiport, () => {
    console.log("listening on *:" + apiport);
});