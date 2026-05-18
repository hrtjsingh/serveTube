import mongoose, { Schema, model, models } from "mongoose";

const songSchema = new Schema({
  id: { type: String, required: true },
});

const PlaylistSchema = new Schema(
  {
    userId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
    name:        { type: String, required: true, default: "My Playlist" },
    description: { type: String, default: "" },
    coverColor:  { type: String, default: "#f8bf59" },
    songs:       [songSchema],
    isDefault:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Playlist = models.Playlist || model("Playlist", PlaylistSchema);
