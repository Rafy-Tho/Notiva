import mongoose from "mongoose";

const { Schema } = mongoose;

const NoteVersionSchema = new Schema({
  title: {
    type: String,
    default: "Untitled",
  },
  content: {
    type: String,
    default: "",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  noteId: {
    type: Schema.Types.ObjectId,
    ref: "Note",
    required: true,
    index: true,
  },
  saveAt: {
    type: Date,
    default: Date.now,
  },
});

NoteVersionSchema.post("save", async function (doc) {
  const Model = doc.constructor;
  const old = await Model.find({ noteId: doc.noteId })
    .sort({ saveAt: -1 })
    .skip(20)
    .select("_id");
  if (old.length)
    await Model.deleteMany({ _id: { $in: old.map((o) => o._id) } });
});

NoteVersionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const NoteVersion = mongoose.model("NoteVersion", NoteVersionSchema);

export default NoteVersion;
