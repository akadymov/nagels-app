module.exports = (req, res) => {
    const token = req.body.token;
    const username = req.body.username;
    const roomId = req.params.roomId;

    var error = null;
  
    if (token === 'badToken' || !token) {
      return res.status(401).json({
        errors:{message:"Unauthorized!"}
      })
    }
  
    if (parseInt(roomId) > 4) {
      error = "Room with id " & roomId & " is not found!"
    }
  
    if (roomId === "1") {
      error = 'Room "oldTestRoom" is closed!'
    }
  
    if (username === "akadymov") {
      error = "Host is always ready!"
    }
  
    if (username === "gsukhy") {
      error = "Only host can change other players' status!"
    }
  
    if (username === "kuznets") {
      error = 'User kuznets is not connected to room "Тюкала"!'
    }

    if(error) {
      return res.status(403).json({errors:{message: error}})
    }
  
    return res.status(200).json({
      "closed": null,
      "connect": "/api/v1/room/" & roomId & "/connect",
      "connectedUserList": [
          {
              "rating": 0,
              "ready": 0,
              "username": "ryabina"
          },
          {
              "rating": 0,
              "ready": 0,
              "username": "koshasa"
          }
      ],
      "created": "Mon, 06 Mar 2023 12:21:56 GMT",
      "games": [],
      "host": "ryabina",
      "roomId": roomId,
      "roomName": "Край земли",
      "status": "open"
  });
};