const { response } = require('express');
const User = require('../models/user');
const Relationship = require('../models/relationship');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const getUsers = async (req, res = response) => {
    const desde = Number(req.query.desde) || 0;
    const currentUserId = req.uid;

    try {
        // Find the current user to get their friends list
        const currentUser = await User.findById(currentUserId);

        if (!currentUser) {
            console.log('flag 1');

            return res.status(404).json({
                ok: false,
                msg: 'Current user not found'
            });
        }

        // Find users excluding the current user
        const usersReached = await User
            .find({ _id: { $ne: currentUserId } })
            .sort('-online')
            .skip(desde)
            .limit(20)
            .exec();

        // Get all relationships for the current user
        const relationships = await Relationship.find({
            $or: [
                { fromUserId: currentUserId },
                { toUserId: currentUserId }
            ]
        });

        // Map through users and determine the relationship status
        const usersWithRelationshipStatus = usersReached.map(user => {
            const relationship = relationships.find(rel =>
                (rel.fromUserId.equals(currentUserId) && rel.toUserId.equals(user._id)) ||
                (rel.toUserId.equals(currentUserId) && rel.fromUserId.equals(user._id))
            );

            let relationshipStatus = 'none';
            if (relationship) {
                if (!(relationship.toUserId.equals(currentUserId) && relationship.status == 'pending')) {
                    relationshipStatus = relationship.status;
                    //relationshipStatus = 'none';
                }
            }

            return {
                uid: user._id,
                name: user.name,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email,
                about: user.about,
                online: user.online,
                lastConnection: user.lastConnection,
                profilePicture: user.profilePicture,
                pinnedChats: user.pinnedChats,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                relationshipStatus: relationshipStatus
            };
        });

        //console.log(usersWithRelationshipStatus);

        res.json({
            ok: true,
            users: usersWithRelationshipStatus,
            desde,
        });

    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({
            ok: false,
            msg: 'An error occurred while processing the request.'
        });
    }
};

const uploadProfilePicture = async (req, res = response) => {
    const currentUserId = req.uid;

    try {
        res.json({
            ok: true,
            msg: 'photo successfully updated!',
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({
            ok: false,
            msg: 'An error occurred while updating user\'s profile picture.'
        });
    }
}

module.exports = {
    getUsers,
    uploadProfilePicture,
}