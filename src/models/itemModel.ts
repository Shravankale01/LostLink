// import mongoose from "mongoose";

// const itemSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     status:  {
//       type: String,
//       enum: ["lost", "found", "claimed", "returned", "closed"],
//       default: "lost"
//     },
//     imageUrl: {
//       type: String,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     isApproved: {
//       type: Boolean,
//       default: false,
//     },
//     isClaimed: {
//       type: Boolean,
//       default: false,
//     },
//     claimedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
// export default Item;

import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ["lost", "found", "claimed", "returned", "closed"], default: "lost" },
    image: { type: Buffer }, // Store image binary data
    imageContentType: { type: String }, // Store MIME type such as 'image/jpeg'
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isApproved: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
export default Item;
