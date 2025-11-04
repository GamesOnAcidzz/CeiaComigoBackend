import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  privateGroupIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Group" }],
  publicGroupIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Group" }],
  tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Group" }],
  menuIds: [mongoose.SchemaTypes.ObjectId],
  createdAt: { type: Date, default: Date.now }
})

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
