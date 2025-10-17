import mongoose, { Schema } from "mongoose";

export interface IQuery extends mongoose.Document {
  title: string;
  status: string;
  query: Object;
  numberOfResults: number;
  createdAt: Date;
  lastUpdate: Date;
  lastUpdatedId: mongoose.Types.ObjectId | null;
}

const QuerySchema = new Schema<IQuery>({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  query: { type: Object, required: true },
  numberOfResults: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: null },
  lastUpdatedId: { type: mongoose.Types.ObjectId, ref: "Data", default: null },
});

export default mongoose.model<IQuery>("Query", QuerySchema);
