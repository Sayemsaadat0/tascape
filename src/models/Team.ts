import { Schema, model, models, type Document, type Model } from "mongoose"

export interface ITeamMember {
  name: string
  role: string
  capacity: number
}

export interface ITeam extends Document {
  title: string
  members: ITeamMember[]
  user_id: string
  createdAt: Date
  updatedAt: Date
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const TeamSchema = new Schema<ITeam>(
  {
    title: { type: String, required: true, trim: true },
    members: { type: [TeamMemberSchema], default: [] },
    user_id: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

export const Team: Model<ITeam> =
  (models.Team as Model<ITeam>) || model<ITeam>("Team", TeamSchema)

export default Team

