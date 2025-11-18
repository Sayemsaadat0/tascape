import { Schema, model, models, type Document, type Model, Types } from "mongoose"

export interface ITeam extends Document {
  title: string
  members: Types.ObjectId[]
  user_id: string
  createdAt: Date
  updatedAt: Date
}

const TeamSchema = new Schema<ITeam>(
  {
    title: { type: String, required: true, trim: true },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    user_id: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Delete cached model if it exists to force recompilation with new schema
if (models.Team) {
  delete models.Team
}

export const Team: Model<ITeam> = model<ITeam>("Team", TeamSchema)

export default Team

