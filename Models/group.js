import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isPrivate: { type: Boolean, required: true },
  capacity: { type: Number },
  hostId: { type: mongoose.SchemaTypes.ObjectId, ref: "UserProfile", required: true },
  tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Tag" }],
  scheduledDate: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  secret: { type: String },
  userProfileIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: "UserProfile" }],
  createdAt: { type: Date, default: Date.now },
  status: { type: Number, default: 0 }
})

const Group = mongoose.model("Group", groupSchema);
export default Group;
