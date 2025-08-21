import mongoose, { Schema, model, models } from "mongoose";

const songSchema = new Schema({
  id: { type: String, required: true },
});

const PlaylistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    songs: [songSchema],
  },
  { timestamps: true }
);

export const Playlist = models.Playlist || model("Playlist", PlaylistSchema);
