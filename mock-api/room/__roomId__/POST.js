module.exports = (req, res) => {
    const token = req.body.token;
    const roomId = req.params.roomId;

    const errors = [];
  
    if (token === 'badToken' || !token) {
      return res.status(401).json({
        field:"token",
        message:"Unauthorized!"
      })
    }
  
    if (![1,2,3].includes(roomId)) {
      errors.push({
        field:"roomId",
        message:"Room #" + roomId + " not found!"
      });
    }
  
    return res.status(200).json({
        "closed": null,
        "connect": "/api/v1/room/" + roomId + "/connect",
        "connectedUsers": [
          {
            "username": "akadymov",
            "ready": false,
            "rating": 2.3
          },
          {
            "username": "kuznets",
            "ready": true,
            "rating": 4.3
          },
          {
            "username": "gigaloff",
            "ready": true,
            "rating": 3.9
          },
          {
            "username": "gsukhy",
            "ready": false,
            "rating": 2.2
          }
        ],
        "created": "Wed, 01 Jul 2020 21:20:41 GMT",
        "host": "akadymov",
        "roomId": roomId,
        "roomName": "Тюкалинские бандиты",
        "status": "open"
    });
};