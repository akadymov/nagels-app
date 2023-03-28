module.exports = (req, res) => {
    const token = req.body.token;
    const roomId = req.params.roomId;

    var errors = null;
  
    if (token === 'badToken') {
      errors.push({
        message:"Unauthorized!"
      })
    }
  
    if (parseInt(roomId) > 4) {
      errors = "Room with specified id does not exist!"
    }
  
    if (roomId === "1") {
      errors="You are already connected to specified room!"
    }
  
    if (roomId === "2") {
      errors = "Room with specified id is full!"
    }

    if(errors) {
      return res.status(403).json({errors:{message: errors}})
    }
  
    return res.status(200).json({
      "closed": null,
      "connect": "/api/v1/room/" & roomId & "/connect",
      "connectedUsers": 2,
      "created": "Mon, 06 Mar 2023 12:21:56 GMT",
      "host": "akadymov",
      "roomId": roomId,
      "roomName": "mockedRoomName",
      "status": "open"
  });
  };