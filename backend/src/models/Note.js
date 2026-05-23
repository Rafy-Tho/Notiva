import mongoose from "mongoose";

const { Schema } = mongoose;

const NoteSchema = new Schema(
  {
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
    notebookId: {
      type: Schema.Types.ObjectId,
      ref: "Notebook",
      index: true,
    },
    tagIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        index: true,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    cover: {
      color: { type: String, default: "" },
      emoji: { type: String, default: "" },
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

NoteSchema.index({ title: "text", content: "text" });

NoteSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Note = mongoose.model("Note", NoteSchema);

export default Note;
