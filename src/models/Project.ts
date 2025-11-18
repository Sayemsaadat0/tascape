import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  Types,
} from "mongoose"

export interface IProject extends Document {
  name: string
  team_id: Types.ObjectId
  user_id: string
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    team_id: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    user_id: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

// Delete cached model if it exists to force recompilation with new schema
if (models.Project) {
  delete models.Project
}

export const Project: Model<IProject> = model<IProject>("Project", ProjectSchema)

export default Project


