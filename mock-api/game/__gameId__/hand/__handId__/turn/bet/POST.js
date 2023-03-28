module.exports = (req, res) => {
    const gameId = req.params.gameId;
    const handId = req.params.handId;
    const token = req.body.token;
    const betSize = req.body.betSize;

    const errors = [];

    const restrictedBetSizes = [
      5,6
    ]

    const openHands = [
        1,2,3,4,5,6
    ]

    const participatingUserTokens = [
        'ryabinaToken',
        'koshasaToken',
        'akulaToken',
        'promoklaToken'
    ]

    const madeBetPlayerTokens = [
        'akulaToken',
        'promoklaToken'
    ]
  
    if (token === 'badToken' || !token) {
      errors.push({
        message:"Unauthorized!"
      })
    }
  
    if (!betSize) {
      errors.push({
        message:"No bet size in request!"
      }) 
    }
  
    if (!participatingUserTokens.includes(token)) {
      errors.push({
        message:"User {username} is not participating in game " & gameId
      }) 
    }
  
    if (!openHands.includes(handId)) {
      errors.push({
        message:"Hand " & handId & " is closed or does not exist!"
      });
    }
  
    if (madeBetPlayerTokens.includes(token)) {
      errors.push({
        message:"User {username} is not participating in game " & gameId
      })
    }
  
    if (restrictedBetSizes.includes(betSize)) {
      errors.push({
          message:"Someone should stay unhappy! Change your bet size since you are last betting player in hand."
        }) 
    }

    if(errors.length>0) {
      return res.status(400).json({errors})
    }

    return res.status(201).json({
        "dealtCardsPerPlayer": 10,
        "gameId": gameId,
        "handId": handId,
        "startingPlayer": "koshasa",
        "trump": "d"
    });
};