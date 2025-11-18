import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  Types,
} from "mongoose"

export interface IActivity extends Document {
  activity_message: string
  task_name: string
  assigned_from_name: string
  assigned_to_name: string
  task_id?: Types.ObjectId
  project_id?: Types.ObjectId
  user_id: string
  createdAt: Date
  updatedAt: Date
}

const ActivitySchema = new Schema<IActivity>(
  {
    activity_message: {
      type: String,
      required: true,
      trim: true,
    },
    task_name: {
      type: String,
      required: true,
      trim: true,
    },
    assigned_from_name: {
      type: String,
      required: true,
      trim: true,
    },
    assigned_to_name: {
      type: String,
      required: true,
      trim: true,
    },
    task_id: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    user_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

// Delete cached model if it exists to force recompilation with new schema
if (models.Activity) {
  delete models.Activity
}

export const Activity: Model<IActivity> = model<IActivity>(
  "Activity",
  ActivitySchema
)

export default Activity

