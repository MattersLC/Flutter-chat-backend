const { Schema, model } = require('mongoose');

const RelationshipSchema = Schema({
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'friends', 'blocked'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

RelationshipSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    return object;
})

module.exports = model('Relationship', RelationshipSchema);
