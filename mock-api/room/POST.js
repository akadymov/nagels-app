module.exports = (req, res) => {
    const token = req.body.token;
    const roomName = req.body.roomName;

    const errors = [];
  
    if (token === 'badToken' || !token) {
      return res.status(401).json({
        field:"token",
        message:"Unauthorized!"
      })
    }
  
    if (roomName === 'room') {
      errors.push({
        field:"roomName",
        message:"Room '" + roomName + "' already exists!"
      });
    }
  
    if (roomName === 'myroom') {
      errors.push({
        field:"roomName",
        message:"Only one open room at a time allowed!"
      });
    }
  
    if (roomName === '') {
      errors.push({
        field:"roomName",
        message:"Room name is required!"
      });
    }

    if(errors.length>0) {
      return res.status(403).json({errors})
    }
  
    return res.status(201).json({
      closed: null,
      connect: "/api/v1/room/4/connect",
      connected_users: 1,
      created: "Wed, 01 Jul 2020 11:55:57 GMT",
      host: "akadymov",
      room_id: 4,
      room_name: roomName,
      status: "open"
    });
  };