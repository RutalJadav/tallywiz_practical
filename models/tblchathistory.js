const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const autoIncrement = require('mongoose-plugin-autoinc');
const schemaOptions = {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'last_updated'
    },
    versionKey: false
};

let tblchathistorySchema = new Schema({
    id: {
        type: Number,
        // enables us to search the record faster
        index: true,
        unique: true,
        required: true
    },
    senderid: {
        type: Number
    },
    receiverid: {
        type: Number
    },
    message: {
        type: String
    }
}, schemaOptions)

tblchathistorySchema.plugin(autoIncrement.plugin, {
    model: 'tblchathistory',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});
var tblchathistory = mongoose.model('tblchathistory', tblchathistorySchema);
module.exports = tblchathistory;