const { response } = require('express');
const User = require('../models/user');

const getChats = async ( req, res = response ) => {
    const desde = Number( req.query.desde ) || 0;

    // Fetch the user's friends
    const user = await User.findById(req.uid).populate('friends');
    const friends = user.friends;

    // Fetch last message info for each friend
    const friendsWithMessages = await Promise.all(friends.map(async (friend) => {
        const lastMessage = await Message.findOne({
            $or: [{ from: req.uid, to: friend._id }, { from: friend._id, to: req.uid }]
        }).sort({ createdAt: 'desc' });

        return {
            _id: friend._id,
            name: friend.name,
            lastMessage: lastMessage ? lastMessage.message : null,
            lastMessageTime: lastMessage ? lastMessage.createdAt : null,
            lastMessageViewed: lastMessage ? lastMessage.viewed : null,
        };
    }));

    // Apply pagination
    const paginatedFriends = friendsWithMessages.slice(desde, desde + 20);
    
    res.json({
        ok: true,
        friends: paginatedFriends,
        desde,
    });
}

module.exports = {
    getChats
}