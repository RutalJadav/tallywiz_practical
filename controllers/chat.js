var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var jwt = require("jwt-simple");
var _ = require("underscore");
var tokenKey = process.env.tokenkey;

const User = require('../models/tbluser');
const ChatHistory = require('../models/tblchathistory');

router.post("/addUser", jsonParser, (req, res) => {
    let objParam = req.body;
    let fullName = (objParam.fullname).trim();
    User.findOne({ fullname: fullName }).then((userRes) => {
        if (userRes != null) {
            res.json({
                msg: "User alredy exist with this name."
            });
        } else {
            let obj = {
                fullname: fullName
            }
            User.create(obj).then((createdUser) => {
                res.json({
                    msg: "User Created Successfully.",
                    data: createdUser
                });
            }).catch((err) => {
                res.json({
                    msg: err.message
                });
            });
        }
    }).catch((err) => {
        res.json({
            msg: err.message
        });
    });
});

router.get("/getAllUserList", jsonParser, (req, res) => {
    User.find().then((userData) => {
        if (userData.length > 0) {
            res.json({
                data: userData
            });
        } else {
            res.json({
                msg: "No Users Found."
            });
        }
    }).catch((err) => {
        res.json({
            msg: err.message
        });
    });
});

router.post("/getRecentChatList", jsonParser, (req, res) => {
    let objParam = req.body;

    if (!objParam) {
        return res.json({
            msg: "Invalid request!",
        });
    }
    if (!objParam.senderid) {
        return res.json({
            msg: "Sender Id is required.",
        });
    }

    ChatHistory.aggregate([
        {
            $match: {
                $or: [
                    {
                        "receiverid": objParam.senderid
                    },
                    {
                        "senderid": objParam.senderid
                    }
                ]
            }
        },
        {
            "$project": {
                senderid: 1,
                receiverid: 1,
                message: 1,
                created_at: 1,
                fromToUser: {
                    $cond: { if: { $eq: ["$senderid", objParam.senderid] }, then: "$receiverid", else: "$senderid" }
                }
            }
        },
        {
            $unwind: "$fromToUser"
        },
        {
            $sort: {
                "fromToUser": -1
            }
        },
        {
            $group: {
                _id: "$_id",
                "fromToUser": {
                    $push: "$fromToUser"
                },
                "senderid": {
                    "$last": "$senderid"
                },
                "receiverid": {
                    "$last": "$receiverid"
                },
                "message": {
                    "$first": "$message"
                },
                "created_at": {
                    "$last": "$created_at"
                }
            }
        },
        {
            "$sort": {
                "created_at": -1
            }
        },
        {
            "$group": {
                "_id": "$fromToUser",
                "fromUser": {
                    "$last": "$senderid"
                },
                "toUser": {
                    "$last": "$receiverid"
                },
                "message": {
                    "$first": "$message"
                },
                "created_at": {
                    "$last": "$created_at"
                }
            }
        },
        {
            $lookup: {
                from: 'tblusers',
                localField: '_id',
                foreignField: 'id',
                as: 'receiverData'
            }
        },
        {
            $unwind: '$receiverData'
        },
        {
            "$project": {
                "message": 1,
                "created_at": 1,
                "receiverData.fullname": 1
            }
        },
    ]).then((response) => {
        if (response.length > 0) {
            _.each(response, (listData) => {
                listData.id = listData._id[0];
                listData.message = jwt.decode(listData.message, tokenKey);
                delete listData._id;
            });
            response.sort((a, b) => b.created_at - a.created_at);
            res.json({
                data: response
            });
        } else {
            res.json({
                msg: "No list found",
                data: []
            });
        }
    }).catch((err) => {
        res.json({
            msg: err.message
        });
    });
});

router.post("/getChatHistoryByUser", jsonParser, (req, res) => {
    let objParam = req.body;

    if (!objParam) {
        return res.json({
            msg: "Invalid request!",
        });
    }
    if (!objParam.senderid) {
        return res.json({
            msg: "Sender Id is required.",
        });
    }
    if (!objParam.receiverid) {
        return res.json({
            msg: "Receiver Id is required.",
        });
    }

    ChatHistory.find({
        senderid: {
            $in: [objParam.senderid, objParam.receiverid]
        },
        receiverid: {
            $in: [objParam.senderid, objParam.receiverid]
        }
    }).sort({ _id: 1 }).then((response) => {
        User.findOne({ id: objParam.receiverid }, { fullname: 1 }).then((receiverRes) => {
            if (response.length > 0) {
                _.each(response, (messageData) => {
                    messageData.message = jwt.decode(messageData.message, tokenKey);
                });
                res.json({
                    receiverData: receiverRes,
                    data: response
                });
            } else {
                res.json({
                    receiverData: receiverRes,
                    data: []
                });
            }
        }).catch((err) => {
            res.json({
                msg: err.message
            });
        });
    }).catch((err) => {
        res.json({
            msg: err.message
        });
    });
});

module.exports = router;