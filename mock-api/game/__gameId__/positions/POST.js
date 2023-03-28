module.exports = (req, res) => {
    const gameId = req.params.gameId;
    const token = req.body.token;

    const errors = [];
  
    if (token === 'badToken' || !token) {
      errors.push({
        message:"Unauthorized!"
      })
    }
  
    if (token === 'nonHostToken') {
      errors.push({
        message:"Only host can shuffle positions!"
      })
    }
  
    if (![1,2,3].includes(gameId)) {
      errors.push({
        message:"Game #" & gameId & " is not started yet!"
      });
    }

    if(errors.length>0) {
      return res.status(400).json({errors})
    }

    return res.status(201).json({
        "gameId": gameId,
        "players": [
            {
                "position": 1,
                "username": "koshasa"
            },
            {
                "position": 2,
                "username": "ryabina"
            }
        ]
    });
};