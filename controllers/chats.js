const { response } = require('express');
const User = require('../models/user');
const Message = require('../models/message');

/*const getChats = async ( req, res = response ) => {
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
}*/

const getChats = async (req, res = response) => {
    const desde = Number(req.query.desde) || 0;

    // Fetch the user's friends
    const user = await User.findById(req.uid).populate('friends');
    const friends = user.friends;

    // Fetch last message info for each friend
    const friendsWithMessages = await Promise.all(friends.map(async (friend) => {
        const lastMessage = await Message.findOne({
            $or: [{ from: req.uid, to: friend._id }, { from: friend._id, to: req.uid }]
        }).sort({ createdAt: 'desc' });

        console.log(`friend: ${friend.name}`);
        const isPinned = friend.pinnedChats.includes(req.uid);
        console.log(`isPinned: ${isPinned}`);
        return {
            user: friend,
            _id: friend._id,
            name: friend.name,
            lastMessage: lastMessage ? lastMessage.message : null,
            lastMessageTime: lastMessage ? lastMessage.createdAt : null,
            lastMessageViewed: lastMessage ? lastMessage.viewed : null,
            isPinned: isPinned,
        };
    }));

    // Separate pinned and general friends
    const pinnedChats = friendsWithMessages.filter(chat => chat.isPinned);
    console.log(pinnedChats);
    console.log('-----------');
    const generalChats = friendsWithMessages.filter(chat => !chat.isPinned && chat.lastMessage != null);
    console.log(generalChats);

    // Apply pagination to general chats
    const paginatedFriends = generalChats.slice(desde, desde + 20);

    /*res.json({
        ok: true,
        pinnedChats,
        generalChats: paginatedFriends,
        desde,
    });*/
    res.json({ 
        ok: true, 
        chats: [...pinnedChats, ...paginatedFriends], // Combine both lists 
        desde, 
    });
};


module.exports = {
    getChats
}