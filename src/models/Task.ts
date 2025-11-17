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
  project_id: Types.ObjectId
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
    project_id: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
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

export const Task: Model<ITask> =
  (models.Task as Model<ITask>) || model<ITask>("Task", TaskSchema)

export default Task

