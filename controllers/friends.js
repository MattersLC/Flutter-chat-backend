const { response } = require('express');
const User = require('../models/user');
const Relationship = require('../models/relationship');

const getFriends = async (req, res = response) => {
    const desde = Number(req.query.desde) || 0;

    try {
        let friends = [];
        // Get all users when fromUserId matchs current user
        const fromUserFriends = await Relationship
            .find({
                $or: [
                    { fromUserId: req.uid, status: 'friends' },
                ]
            })
            .populate('toUserId status')
            .skip(desde)
            .limit(20)
            .exec();
        
        // Add users to friends list
        fromUserFriends.map(friend => ( friends.push({
            uid: friend.toUserId._id,
            name: friend.toUserId.name,
            lastName: friend.toUserId.lastName,
            email: friend.toUserId.email,
            about: friend.toUserId.about,
            profilePicture: friend.toUserId.profilePicture,
            relationshipStatus: friend.status,
            online: friend.toUserId.online,
            lastConnection: friend.toUserId.lastConnection,
        })));

        // Get all users when toUserId matchs current user
        const toUserFriends = await Relationship
            .find({
                $or: [
                    { toUserId: req.uid, status: 'friends' }
                ]
            })
            .populate('fromUserId status')
            .skip(desde)
            .limit(20)
            .exec();

        // Add users to friends list
        toUserFriends.map(friend => ( friends.push({
            uid: friend.fromUserId._id,
            name: friend.fromUserId.name,
            lastName: friend.fromUserId.lastName,
            email: friend.fromUserId.email,
            about: friend.fromUserId.about,
            profilePicture: friend.fromUserId.profilePicture,
            relationshipStatus: friend.status,
            online: friend.fromUserId.online,
            lastConnection: friend.fromUserId.lastConnection,
        })));
        
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
                    { toUserId: req.uid, status: 'pending' }
                ]
            })
            .populate('fromUserId status')
            .skip(desde)
            .limit(20)
            .exec();

        // Transform the result to return only the fields you need
        const formattedFriends = friends.map(friend => ({
            uid: friend.fromUserId._id,
            name: friend.fromUserId.name,
            lastName: friend.fromUserId.lastName,
            email: friend.fromUserId.email,
            about: friend.fromUserId.about,
            profilePicture: friend.fromUserId.profilePicture,
            relationshipStatus: friend.status,
            online: friend.fromUserId.online,
            lastConnection: friend.fromUserId.lastConnection,
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
    console.log('here');
    console.log(req.uid)
    try {
        const friends = await Relationship
            .find({
                $or: [
                    { fromUserId: req.uid, status: 'pending' },
                ]
            })
            .populate('toUserId status')
            .skip(desde)
            .limit(20)
            .exec();
        console.log(friends)

        // Transform the result to return only the fields you need
        const formattedFriends = friends.map(friend => ({
            uid: friend.toUserId._id,
            name: friend.toUserId.name,
            lastName: friend.toUserId.lastName,
            email: friend.toUserId.email,
            about: friend.toUserId.about,
            profilePicture: friend.toUserId.profilePicture,
            relationshipStatus: friend.status,
            online: friend.toUserId.online,
            lastConnection: friend.toUserId.lastConnection,
        }));

        console.log('you must be here')
        console.log(formattedFriends)

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
                    { toUserId: req.uid, status: 'pending' }
                ]
            })
            .populate('fromUserId')
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
                    { fromUserId: req.uid, status: 'pending' },
                ]
            })
            .populate('toUserId')
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
        const fromUserId = req.uid; // Current logged-in user

        // Check if users exists
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);
        
        if (!fromUser || !toUser) {
            return res.status(404).json({
                ok: false,
                msg: 'One or both users not found.'
            });
        }

        // Check if the relationship already exists for both users as friends
        const relationshipFriendsExists = await Relationship.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId, status: 'friends' },
                { fromUserId: toUserId, toUserId: fromUserId, status: 'friends' }
            ]
        });

        if (relationshipFriendsExists) {
            return res.status(400).json({
                ok: false,
                relationship: relationshipFriendsExists.status,
                msg: 'A relationship as friends already exists between these users.'
            });
        }

        // Check if the relationship already exists (current user already sent a friend request before)
        const relationshipFromUserExists = await Relationship.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId }
            ]
        });

        if (relationshipFromUserExists) {
            return res.status(400).json({
                ok: false,
                relationship: relationshipFromUserExists.status,
                msg: 'A relationship already exists between these users.'
            });
        }

        // Check if the relationship already exists (destination user already have sent a friend request before)
        const relationshipToUserExists = await Relationship.findOne({
            $or: [
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (relationshipToUserExists) {
            // Accept the friend request
            console.log('relationshipToUserExists exists');
            console.log(relationshipToUserExists);
            relationshipToUserExists.status = 'friends';
            relationshipToUserExists.updatedAt = Date.now();
            await relationshipToUserExists.save();
            
            return res.json({ 
                ok: true,
                relationship: relationshipToUserExists.status,
                msg: 'You\'re now friends.',
            });
        }

        // Create a new relationship document
        const relationship = new Relationship({
            fromUserId,
            toUserId,
            status: 'pending'
        });

        // Save the relationship to the database
        await relationship.save();

        res.json({ 
            ok: true,
            relationship: relationship.status,
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

const unsendFriendRequest = async (req, res = response) => {
    try {
        const { toUserId } = req.body;
        const fromUserId = req.uid; // Current logged-in user

        // Check if users exists
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);
        
        if (!fromUser || !toUser) {
            return res.status(404).json({
                ok: false,
                msg: 'One or both users not found.'
            });
        }

        // Check if the relationship already exists (current user already sent a friend request before)
        const relationship = await Relationship.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId }
            ]
        });

        if (!relationship) {
            return res.status(400).json({
                ok: true,
                msg: 'Doesn\'t exists a relationship between these users.'
            });
        }

        // Delete relationship document
        await Relationship.findByIdAndDelete(relationship._id);

        res.json({ 
            ok: true,
            msg: 'Friend request unsent successfully.',
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ 
            ok: false, 
            msg: 'An error occurred while processing the request.' 
        });
    }
};

const respondFriendRequest = async ( req, res = response ) => {
    console.log('here!');
    try {
        const { toUserId, isAccepted } = req.body;
        const fromUserId = req.uid; // Current logged-in user

        // Check if users exists
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);
        
        if (!fromUser || !toUser) {
            return res.status(404).json({ 
                ok: false, 
                msg: 'One or both users not found.' 
            });
        }

        // Check if the relationship exists
        const relationship = await Relationship.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
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
            relationship.updatedAt = Date.now;
            await relationship.save();
        } else {
            console.log('wdym??');
            
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

const deleteFriend = async (req, res = response) => {
    try {
        const { toUserId } = req.body;
        const fromUserId = req.uid; // Current logged-in user

        // Check if users exists
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);
        
        if (!fromUser || !toUser) {
            return res.status(404).json({
                ok: false,
                msg: 'One or both users not found.'
            });
        }

        // Check if the relationship already exists (current user already sent a friend request before)
        const relationship = await Relationship.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (!relationship) {
            return res.status(400).json({
                ok: true,
                msg: 'Doesn\'t exists a relationship between these users.'
            });
        }

        // Delete relationship document
        await Relationship.findByIdAndDelete(relationship._id);

        res.json({ 
            ok: true,
            msg: 'Friend deleted successfully.',
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ 
            ok: false, 
            msg: 'An error occurred while processing the request.' 
        });
    }
};

module.exports = {
    getFriends,
    getFriendRequests,
    getSentFriendRequests,
    getTotalFriendRequests,
    getTotalSentFriendRequests,
    sendFriendRequest,
    unsendFriendRequest,
    respondFriendRequest,
    deleteFriend,
}