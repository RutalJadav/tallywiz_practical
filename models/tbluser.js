const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const autoIncrement = require("mongoose-plugin-autoinc");

const schemaOptions = {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "last_updated",
    },
    versionKey: false,
};

let tbluserSchema = new Schema(
    {
        id: {
            type: Number,
            // enables us to search the record faster
            index: true,
            unique: true,
            required: true,
        },
        fullname: {
            type: String,
            default: "",
        },
    },
    schemaOptions
);

tbluserSchema.plugin(autoIncrement.plugin, {
    model: "tbluser",
    field: "id",
    startAt: 1,
    incrementBy: 1,
});
var tbluser = mongoose.model("tbluser", tbluserSchema);
module.exports = tbluser;
