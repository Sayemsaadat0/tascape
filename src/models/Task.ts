import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  Types,
} from "mongoose"

export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const TASK_STATUSES = ["Pending", "In Progress", "Done"] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface ITask extends Document {
  title: string
  description?: string
  assigned_member?: Types.ObjectId
  member_id?: Types.ObjectId
  project_id: Types.ObjectId
  user_id: string
  priority: TaskPriority
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assigned_member: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    member_id: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user_id: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "Medium",
      required: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "Pending",
      required: true,
    },
  },
  { timestamps: true }
)

// Delete cached model if it exists to force recompilation with new schema
if (models.Task) {
  delete models.Task
}

export const Task: Model<ITask> = model<ITask>("Task", TaskSchema)

export default Task

