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
                    { relatedUserId: req.uid, status: 'pending' }
                ]
            })
            .populate('userId')
            .skip(desde)
            .limit(20)
            .exec();

        // Transform the result to return only the fields you need
        const formattedFriends = friends.map(friend => ({
            uid: friend.userId._id,
            name: friend.userId.name,
            email: friend.userId.email,
            about: friend.userId.about,
            online: friend.userId.online,
            lastConnection: friend.userId.lastConnection,
        }));
        
        res.json({
            ok: true,
            friends: formattedFriends,
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
        console.log(req.uid);
        const friends = await Relationship
            .find({
                $or: [
                    { userId: req.uid, status: 'pending' },
                ]
            })
            .populate('relatedUserId')
            .skip(desde)
            .limit(20)
            .exec();

        // Transform the result to return only the fields you need
        const formattedFriends = friends.map(friend => ({
            uid: friend.relatedUserId._id,
            name: friend.relatedUserId.name,
            email: friend.relatedUserId.email,
            about: friend.relatedUserId.about,
            online: friend.relatedUserId.online,
            lastConnection: friend.relatedUserId.lastConnection,
        }));

        res.json({
            ok: true,
            friends: formattedFriends,
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
                    { relatedUserId: req.uid, status: 'pending' }
                ]
            })
            .populate('userId')
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
                    { userId: req.uid, status: 'pending' },
                ]
            })
            .populate('relatedUserId')
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
        const { toUserId, status } = req.body; // Extract relatedUserId and status from the request body
        const fromUserId = req.uid; // Assuming req.uid holds the ID of the logged-in user

        // Check if users exist (optional, depending on your app's needs)
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser || !toUser) {
            return res.status(404).json({
                ok: false,
                msg: 'One or both users not found.'
            });
        }

        // Check if the relationship already exists
        const relationshipExists = await Relationship.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (relationshipExists) {
            return res.status(400).json({
                ok: false,
                msg: 'A relationship already exists between these users.'
            });
        }

        // Create a new relationship document
        const relationship = new Relationship({
            userId: fromUserId,
            toUserId,
            status: status || 'pending' // Default status to 'pending' if not provided
        });

        // Save the relationship to the database
        await relationship.save();
        console.log('relationship saved');

        res.json({ 
            ok: true,
            relationship,
            msg: 'Friend request sent successfully.',
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ 
            ok: false, 
            msg: 'An error occurred while processing the request.' 
        });
    }
};

/*const sendFriendRequest = async (req, res = response) => {
    try {
        const { relatedUserId, status } = req.body;
        const fromUserId = req.uid;

        const fromUser = await User.findById(fromUserId);
        const relatedUser = await User.findById(relatedUserId);

        if (!fromUser || !relatedUser) {
            return res.status(404).json({
                ok: false,
                msg: 'One or both users not found.'
            });
        }

        console.log(`fromUserId: ${fromUserId}`);
        console.log(`relatedUserId: ${relatedUserId}`);
        console.log(`status: ${status}`);

        const relationshipExists = await Relationship.findOne({ 
            userId: fromUserId, 
            relatedUserId 
        });

        console.log(relationshipExists)

        if ( relationshipExists ) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe una relación'
            });
        }

        const relationship = new Relationship({
            userId: fromUserId,
            relatedUserId,
            status: status || 'pending' // Default status to 'pending' if not provided
        });

        await relationship.save();

        res.json({ 
            ok: true,
            relationship,
            msg: 'Friend request sent',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ ok: false, msg: 'An error occurred' });
    }
};*/

const respondFriendRequest = async ( req, res = response ) => {
    console.log('here!');
    try {
        const { toUserId, isAccepted } = req.body;
        const fromUserId = req.uid;

        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);
        
        if (!fromUser || !toUser) {
            return res.status(404).json({ ok: false, msg: 'User not found' });
        }

        const relationship = await Relationship.findOne({
            $or: [
                { userId: fromUserId, relatedUserId: relatedUserId },
                { userId: relatedUserId, relatedUserId: fromUserId }
            ]
        });

        if (!relationship) {
            return res.status(400).json({
                ok: false,
                msg: 'A relationship already exists between these users.'
            });
        }

        if (isAccepted) {
            relationship.status = 'friends';
            await relationship.save();
        } else {
            await Relationship.findByIdAndDelete(relationship._id);
        }


        /*if (fromUser.friendRequests.includes(toUserId)) {
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
        }*/

        res.json({ ok: true, msg: 'update completed', });
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