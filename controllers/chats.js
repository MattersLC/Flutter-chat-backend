const { response } = require('express');
const User = require('../models/user');
const Relationship = require('../models/relationship');
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

/*const getChats = async (req, res = response) => {
    const desde = Number(req.query.desde) || 0;

    // Fetch the user's friends
    const user = await User.findById(req.uid).populate('friends');
    const friends = user.friends;

    console.log('------- User -------');
    console.log(user);

    console.log('------- Friends -------');
    console.log(friends);

    // Fetch last message info for each friend
    const friendsWithMessages = await Promise.all(friends.map(async (friend) => {
        const lastMessage = await Message.findOne({
            $or: [{ from: req.uid, to: friend._id }, { from: friend._id, to: req.uid }]
        }).sort({ createdAt: 'desc' });

        console.log('------- Friend -------');
        console.log(friend);

        //console.log(`friend: ${friend.name}`);
        const isPinned = friend.pinnedChats.includes(req.uid);
        //console.log(`isPinned: ${isPinned}`);
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
    //console.log(pinnedChats);
    //console.log('-----------');
    const generalChats = friendsWithMessages.filter(chat => !chat.isPinned && chat.lastMessage != null);
    //console.log(generalChats);

    // Apply pagination to general chats
    const paginatedFriends = generalChats.slice(desde, desde + 20);

    res.json({ 
        ok: true, 
        chats: [...pinnedChats, ...paginatedFriends], // Combine both lists 
        desde, 
    });
};*/

const getChats = async (req, res = response) => {
    const desde = Number(req.query.desde) || 0;

    // Fetch the user's id
    const userId = req.uid;

    // Get the current user
    const currentUser = await User.findById(userId);

    // Get all relationships where the user is either the 'user_id' or 'related_user_id' with status "friend"
    const relationships = await Relationship.find({
        $or: [
            { fromUserId: userId, status: 'friends' },
            { toUserId: userId, status: 'friends' }
        ]
    }).populate('fromUserId toUserId');

    // Extract friends from relationships
    const friends = relationships.map(rel => {
        return rel.fromUserId._id.toString() === userId ? rel.toUserId : rel.fromUserId;
    });

    // Fetch last message info for each friend
    const friendsWithMessages = await Promise.all(friends.map(async (friend) => {
        const lastMessage = await Message.findOne({
            $or: [{ from: userId, to: friend._id }, { from: friend._id, to: userId }]
        }).sort({ createdAt: 'desc' });

        // Check if the chat is pinned by the user
        const isPinned = currentUser.pinnedChats.includes(friend._id);

        return {
            //user: friend,
            _id: friend._id,
            name: friend.name,
            online: friend.online,
            lastMessage: lastMessage ? lastMessage.message : null,
            lastMessageTime: lastMessage ? lastMessage.createdAt : null,
            lastMessageViewed: lastMessage ? lastMessage.viewed : null,
            profilePicture: friend.profilePicture,
            isPinned: isPinned,
        };
    }));

    // Separate pinned and general friends
    const pinnedChats = friendsWithMessages.filter(chat => chat.isPinned);
    const generalChats = friendsWithMessages.filter(chat => !chat.isPinned && chat.lastMessage != null);

    // Apply pagination to general chats
    const paginatedFriends = generalChats.slice(desde, desde + 20);

    // Return the combined result with pinned chats first
    res.json({ 
        ok: true, 
        //chats: [...pinnedChats, ...paginatedFriends], // Combine pinned and general chats
        chats: paginatedFriends,
        pinnedChats: pinnedChats,
        desde, 
    });
};

const pinChat = async ( req, res = response ) => {
    console.log('pinChat module');
    const { toUserId } = req.body;
    const fromUserId = req.uid;

    // Check if users exists
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    
    if (!fromUser || !toUser) {
        return res.status(404).json({
            ok: false,
            msg: 'One or both users not found.'
        });
    }

    fromUser.pinnedChats.push(toUserId);
    console.log(fromUser);
    await fromUser.save();

    res.json({ 
        ok: true,
        msg: 'Chat pinned successfully.',
    });
}

const unpinChat = async ( req, res = response ) => {
    console.log('unpinChat module');
    const { toUserId } = req.body;
    const fromUserId = req.uid;

    // Check if users exists
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    
    if (!fromUser || !toUser) {
        return res.status(404).json({
            ok: false,
            msg: 'One or both users not found.'
        });
    }

    console.log('removing chat from pinned chats');
    fromUser.pinnedChats.remove(toUserId);
    console.log(fromUser);
    await fromUser.save();

    res.json({ 
        ok: true,
        msg: 'Chat unpinned successfully.',
    });
}

module.exports = {
    getChats,
    pinChat,
    unpinChat,
}