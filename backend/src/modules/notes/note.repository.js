import mongoose from "mongoose";
import Note from "../../models/Note.js";

export async function findMany(userId, filter, options) {
  return Note.find({ userId, ...filter })
    .sort(options.sort)
    .skip(options.skip)
    .limit(options.limit);
}

export async function countMany(userId, filter) {
  return Note.countDocuments({ userId, ...filter });
}

export async function findById(userId, id) {
  return Note.findOne({ _id: id, userId });
}

export async function createOne(data) {
  return Note.create(data);
}

export async function findByIdAndUpdate(id, updates) {
  return Note.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { new: true, runValidators: true }
  );
}

export async function deleteOne(userId, id) {
  return Note.deleteOne({ _id: id, userId });
}

export async function findTrash(userId) {
  return Note.find({ userId, deletedAt: { $ne: null } });
}

export async function aggregateNoteCounts(userId) {
  return Note.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
    { $group: { _id: "$notebookId", count: { $sum: 1 } } },
    { $project: { _id: 0, id: "$_id", count: 1 } },
  ]);
}

export async function aggregateTagCounts(userId) {
  return Note.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
    { $unwind: { path: "$tagIds", preserveNullAndEmptyArrays: false } },
    { $group: { _id: "$tagIds", count: { $sum: 1 } } },
    { $project: { _id: 0, id: "$_id", count: 1 } },
  ]);
}
