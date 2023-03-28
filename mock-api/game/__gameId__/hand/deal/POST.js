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
        message:"Only host can deal cards!"
      })
    }
  
    if (![1,2,3].includes(gameId)) {
      errors.push({
        message:"Game " & gameId & " has open hand 5! You should finish it before dealing new hand!"
      });
    }
  
    if (![4,5,6].includes(gameId)) {
      errors.push({
        message:"All hands in game " & gameId & " are already dealt!"
      });
    }

    if(errors.length>0) {
      return res.status(400).json({errors})
    }

    return res.status(201).json({
        "dealtCardsPerPlayer": 10,
        "gameId": 26,
        "handId": 22,
        "startingPlayer": "koshasa",
        "trump": "d"
    });
};