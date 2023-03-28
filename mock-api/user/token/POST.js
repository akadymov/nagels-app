module.exports = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const errors = [];

    const allowedLoginPairs = [
      {
        'username': 'ryabina',
        'password': 'Ryabina'
      },
      {
        'username': 'koshasa',
        'password': 'time2eat'
      },
      {
        'username': 'promokla',
        'password': 'kometa'
      },
      {
        'username': 'akadymov',
        'password': 'akulaMatata'
      },
      {
        'username': 'gsukhy',
        'password': 'bratishka'
      },
      {
        'username': 'kuznets',
        'password': 'bandit'
      },
      {
        'username': 'gigaloff',
        'password': 'giganlimon'
      }
    ]
  
    if (allowedLoginPairs.includes({
      'username': username,
      'password': password
    })) {
      errors.push({
        field:"username",
        message:"   "
      });
      errors.push({
        field:"password",
        message:"Invalid username or password"
      });
    };

    if(errors.length>0) {
      return res.status(401).json({errors})
    }
  
    return res.status(201).json({
      expiresIn: 86400,
      token: "fakeToken"
    });
  };