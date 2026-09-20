import mongoose from "mongoose";

const { Schema } = mongoose;

const TagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "245 80% 66%",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

TagSchema.index({ userId: 1, name: 1 }, { unique: true });

TagSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_d, r) => {
    r.id = r._id;
    delete r._id;
    delete r.__v;
    return r;
  },
});

const Tag = mongoose.model("Tag", TagSchema);

export default Tag;
