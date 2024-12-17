const { response } = require('express');
const User = require('../models/user');
const Relationship = require('../models/relationship');

const getFriends = async (req, res = response) => {
    const desde = Number(req.query.desde) || 0;

    try {
        const friends = await Relationship
            .find({
                $or: [
                    { user_id: req.uid, status: 'friend' },
                    { related_user_id: req.uid, status: 'friend' }
                ]
            })
            .populate('user_id related_user_id')
            .skip(desde)
            .limit(20)
            .exec();

        console.log(friends);
        
        res.json({
            ok: true,
            friends,
            desde,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'An error occurred while fetching friend requests'
        });
    }
};

const getFriendRequests = async (req, res = response) => {
    const desde = Number(req.query.desde) || 0;

    try {
        const friends = await Relationship
            .find({
                $or: [
                    { related_user_id: req.uid, status: 'pending' }
                ]
            })
            .populate('user_id related_user_id')
            .skip(desde)
            .limit(20)
            .exec();

        console.log(friends);
        
        res.json({
            ok: true,
            friends,
            desde,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'An error occurred while fetching friend requests'
        });
    }
}

const getSentFriendRequests = async (req, res = response) => {
    const desde = Number(req.query.desde) || 0;

    try {
        const friends = await Relationship
            .find({
                $or: [
                    { user_id: req.uid, status: 'pending' },
                ]
            })
            .populate('user_id related_user_id')
            .skip(desde)
            .limit(20)
            .exec();

        console.log(friends);
        
        res.json({
            ok: true,
            friends,
            desde,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'An error occurred while fetching friend requests'
        });
    }
};

const getTotalFriendRequests = async ( req, res = response ) => {
    const desde = Number( req.query.desde ) || 0;

    try {
        const friendRequests = await Relationship
            .find({
                $or: [
                    { related_user_id: req.uid, status: 'pending' }
                ]
            })
            .populate('user_id related_user_id')
            .exec();

        const totalFriendRequests = friendRequests.length;

        res.json({
            ok: true,
            totalFriendRequests,
            desde,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'An error occurred while fetching friend requests'
        });
    }
}

const getTotalSentFriendRequests = async ( req, res = response ) => {
    const desde = Number( req.query.desde ) || 0;

    try {
        const sentFriendRequests = await Relationship
            .find({
                $or: [
                    { user_id: req.uid, status: 'pending' },
                ]
            })
            .populate('user_id related_user_id')
            .exec();

        const totalSentFriendRequests = sentFriendRequests.length;

        res.json({
            ok: true,
            totalSentFriendRequests,
            desde,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'An error occurred while fetching friend requests'
        });
    }
}

const sendFriendRequest = async (req, res = response) => {
    try {
        const { toUserId } = req.body;
        const fromUserId = req.uid;

        const relationshipExists = await Relationship.findOne({ user_id })

        /*const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser || !toUser) {
            return res.status(404).json({ ok: false, msg: 'User not found' });
        }

        // Enviamos la solicitud al usuario deseado y guardamos el registro 
        // en las solicitudes enviadas del usuario
        if (!toUser.friendRequests.includes(fromUserId)) {
            toUser.friendRequests.push(fromUserId);
            await toUser.save();
            fromUser.sentFriendRequests.push(toUserId);
            await fromUser.save();
        }*/

        res.json({ ok: true, msg: 'Friend request sent', });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred' });
    }
};

const respondFriendRequest = async ( req, res = response ) => {
    console.log('here!');
    try {
        const { toUserId, isAccepted } = req.body;
        const fromUserId = req.uid;

        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        console.log(`hey! - toUserId: ${toUserId} - fromUserId: ${fromUserId} - isAccepted: ${isAccepted}`);

        if (!fromUser || !toUser) {
            return res.status(404).json({ ok: false, msg: 'User not found' });
        }

        if (fromUser.friendRequests.includes(toUserId)) {
            console.log('hey?');
            if (isAccepted) {
                fromUser.friendRequests.pull(toUserId);
                fromUser.friends.push(toUserId);
                fromUser.save();

                toUser.sentFriendRequests.pull(fromUserId);
                toUser.friends.push(fromUserId);
                toUser.save();
            } else {
                console.log('were in else statment');
                fromUser.friendRequests.pull(toUserId);
                await fromUser.save();

                toUser.sentFriendRequests.pull(fromUserId);
                await toUser.save();
            }
        }

        res.json({ ok: true, msg: 'Please write a good response message here', });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred' });
    }
};


module.exports = {
    getFriends,
    getFriendRequests,
    getSentFriendRequests,
    getTotalFriendRequests,
    getTotalSentFriendRequests,
    sendFriendRequest,
    respondFriendRequest,
}