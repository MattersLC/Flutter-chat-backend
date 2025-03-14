const { Schema, model } = require('mongoose');
const moment = require('moment-timezone');

const MessageSchema = Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    viewed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

/*MessageSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    return object;
});*/

MessageSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    
    // Convert UTC to local time 
    object.createdAt = moment(object.createdAt).tz('America/Mexico_City').format();
    object.updatedAt = moment(object.updatedAt).tz('America/Mexico_City').format();
    object.uid = _id;

    return object;
});

module.exports = model('Message', MessageSchema);