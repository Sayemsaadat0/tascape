import { Schema, model, models, type Document, type Model } from "mongoose"

export interface IMember extends Document {
  name: string
  role: string
  capacity: number
  used_capacity: number
  user_id: string
  createdAt: Date
  updatedAt: Date
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 0, max: 5 },
    used_capacity: { type: Number, required: true, default: 0, min: 0, max: 5 },
    user_id: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    strict: true,
  }
)

// Delete cached model if it exists to force recompilation with new schema
if (models.Member) {
  delete models.Member
}

export const Member: Model<IMember> = model<IMember>("Member", MemberSchema)

export default Member

