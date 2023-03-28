module.exports = (req, res) => {
    return res.status(201).json({
        "gameId": 26,
        "gameScores": [],
        "host": "ryabina",
        "players": [
            "ryabina",
            "koshasa"
        ],
        "room": "край земли",
        "started": "Mon, 06 Mar 2023 12:40:49 GMT",
        "startedHands": [],
        "status": "active"
    });
};