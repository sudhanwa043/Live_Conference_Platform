const express = require('express');
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
const peerServer = ExpressPeerServer(server, {
    debug: true,
})
const path = require("path");

app.set("view engine", "ejs");
//app.use("/public", express.static(path.join(__dirname, "/Static")));
app.use(express.static(__dirname + '/Static'));
app.use("/peerjs", peerServer);

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/join", (req, res) => {
    res.redirect(
        url.format({
            pathname: `/join/${uuidv4()}`,
            query: req.query,
        })
    );
    console.log(req.query)
}); 

app.get("/joinold", (req, res) => {
    res.redirect(
        url.format({
            pathname: req.query.meeting_id,
            query: req.query,
        })
    );
    console.log(req.query.meeting_id)
});

app.get("/join/:rooms", (req, res) => {
    res.render("room1", { roomid: req.params.rooms, Myname: req.query.name });
    console.log(req.query)
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, id, myname) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", id, myname);
        console.log("user-connected")

        socket.on("messagesend", (message) => {
            console.log(message);
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (myname) => {
            console.log(myname);
            socket.to(roomId).emit("AddName", myname);
        });

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", id);
        });
    });
});


server.listen(process.env.PORT || 3000);