const { Schema, model } = require('mongoose');

// Function to generate a random username
const generateUsername = (name) => {
    const randomNum = Math.floor(Math.random() * 1000);
    const sanitizedUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${sanitizedUsername}${randomNum}`;
};

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        unique: true,
        default: function() {
            return generateUsername(this.name);
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    about: {
        type: String,
        default: 'Hello! I\'m new here!'
    },
    online: {
        type: Boolean,
        default: false
    },
    lastConnection: {
        type: Date,
        default: null
    },
    profilePicture: {
        type: String,
        default: ''
    },
    pinnedChats: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    notifications: [{
        type: {
            type: String, // e.g., "mention", "friendRequest", etc.
            required: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String, // e.g., "You have been mentioned in a group chat", "New friend request from XYZ", etc.
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            required: true
        },
        read: {
            type: Boolean,
            default: false
        }
    }],
}, {
    timestamps: true,
});

UserSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
});

UserSchema.virtual('popularity').get(function() {
    return this.friends.length;
});

module.exports = model('User', UserSchema);