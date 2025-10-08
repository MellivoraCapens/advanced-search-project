import mongoose, { Schema } from "mongoose";

export interface IData extends mongoose.Document {
  fullName: string;
  email: string;
  sex: string;
  birthdate: Date;
  hobbies: string[];
  languages: string[];
  company: string;
  role: string;
  description: string;
  experience: string;
  education: string;
  phoneNumber: string;
  address: {
    city: string;
    state: string;
    streetAddress: string;
    zipCode: string;
  };
  savedQueryIds: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const DataSchema = new Schema<IData>({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  sex: {
    type: String,
    enum: ["male", "female"],
  },
  birthdate: {
    type: Date,
  },
  hobbies: {
    type: [String],
  },
  languages: {
    type: [String],
  },
  company: {
    type: String,
  },
  role: {
    type: String,
  },
  description: {
    type: String,
  },
  experience: {
    type: String,
  },
  education: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    city: String,
    state: String,
    streetAddress: String,
    zipCode: String,
  },
  savedQueryIds: [{ type: mongoose.Types.ObjectId, ref: "Query" }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

DataSchema.index({
  description: "text",
  experience: "text",
  education: "text",
});

export default mongoose.model<IData>("Data", DataSchema);
