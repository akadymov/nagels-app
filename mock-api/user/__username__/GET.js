module.exports = (req, res) =>
  res.status(200).json({
    aboutMe: null,
    email: "some@email.com",
    lastSeen: Date.now(),
    preferredLang: "en",
    registered: Date.now(),
    username: req.params.username
  });