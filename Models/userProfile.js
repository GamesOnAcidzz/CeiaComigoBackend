import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Tag" }],
  favouriteRests: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Restaurant' }]
});


const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;

