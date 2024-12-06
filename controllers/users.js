const { response } = require('express');
const User = require('../models/user');

const getUsers = async ( req, res = response ) => {
    const desde = Number( req.query.desde ) || 0;

    const users = await User
        .find({ _id: { $ne: req.uid } })
        .sort('-online')
        .skip(desde)
        .limit(20)
        .exec();
    

    res.json({
        ok: true,
        users,
        desde,
    });
}

const sendFriendRequest = async (req, res = response) => {
    try {
        const { toUserId } = req.body;
        const fromUserId = req.uid;

        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser || !toUser) {
            return res.status(404).json({ ok: false, msg: 'User not found' });
        }

        // Enviamos la solicitud al usuario deseado y guardamos el registro 
        // en las solicitudes enviadas del usuario
        if (!toUser.friendRequests.includes(fromUserId)) {
            toUser.friendRequests.push(fromUserId);
            fromUser.sentFriendRequests.push(toUserId);
            await toUser.save();
            await fromUser.save();
        }

        res.json({ ok: true, msg: 'Friend request sent', });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred' });
    }
};

module.exports = {
    getUsers,
    sendFriendRequest
}