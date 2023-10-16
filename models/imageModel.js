const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    thumbnailUrl: String,
    imageUrl: String,
});

module.exports = mongoose.model("Images", imageSchema);