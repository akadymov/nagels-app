module.exports = (req, res) => {
    const token = req.body.token;
    const roomId = req.params.roomId;

    var error = null;
  
    if (token === 'badToken' || !token) {
      return res.status(401).json({
        errors:{message:"Unauthorized!"}
      })
    }
  
    if (roomId === "10") {
      error = "Room with specified id does not exist!"
    }
  
    if (roomId === "2") {
      error="You are not connected to specified room!"
    }
  
    if (roomId === "3") {
      error = "You cannot disconnect from hosted room!"
    }

    if(error) {
      return res.status(403).json({errors:{message: error}})
    }
  
    return res.status(200).json({});
  };