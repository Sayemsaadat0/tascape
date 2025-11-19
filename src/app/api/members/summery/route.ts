import { NextResponse } from "next/server"
import "@/DB/db"
import { authenticateRequest } from "@/lib/auth"
import { Member } from "@/models/Member"
import { Task } from "@/models/Task"
import "@/models/Project"
import { Types } from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const normalizeObjectId = (value: unknown) => {
  try {
    if (!value) return null
    if (typeof value === "string" && Types.ObjectId.isValid(value)) {
      return value
    }
    if (value instanceof Types.ObjectId) {
      return value.toString()
    }
    // Some mongoose docs have _id in nested object
    if (typeof value === "object" && value !== null && "_id" in value) {
      const nested = (value as { _id?: Types.ObjectId | string })._id
      if (nested) {
        return normalizeObjectId(nested)
      }
    }
    return null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const authResult = authenticateRequest(request)
  if ("response" in authResult) {
    return authResult.response
  }

  try {
    const tokenPayload = authResult.payload.tokenPayload
    let requestUserId = authResult.payload.userId

    if (typeof tokenPayload !== "string" && tokenPayload?.sub) {
      requestUserId = String(tokenPayload.sub)
    }

    if (!requestUserId) {
      return NextResponse.json(
        { success: false, message: "Unable to resolve user from token" },
        { status: 401 }
      )
    }

    const members = await Member.find({ user_id: requestUserId })
      .sort({ createdAt: -1 })
      .lean()

    if (!members.length) {
      return NextResponse.json(
        { success: true, message: "No members found for summary", results: [] },
        { status: 200 }
      )
    }

    const memberIdMap = new Map<string, typeof members[number]>()
    const memberIds: Types.ObjectId[] = []

    for (const member of members) {
      const memberId = normalizeObjectId(member._id)
      if (memberId) {
        memberIdMap.set(memberId, member)
        memberIds.push(new Types.ObjectId(memberId))
      }
    }

    const tasks = await Task.find({
      user_id: requestUserId,
      member_id: { $in: memberIds },
    })
      .select("title priority member_id project_id")
      .populate({ path: "project_id", select: "name" })
      .lean()

    const tasksByMember = new Map<string, Array<{
      task_id: string
      task_name: string
      project_name: string
      priority: string
    }>>()

    for (const task of tasks) {
      const memberId = normalizeObjectId(task.member_id)
      if (!memberId) continue

      const projectName =
        (task.project_id &&
          typeof task.project_id === "object" &&
          "name" in task.project_id &&
          (task.project_id as { name?: string }).name) ||
        "Unknown Project"

      const entry = {
        task_id: normalizeObjectId(task._id) ?? "",
        task_name: task.title,
        project_name: projectName,
        priority: task.priority,
      }

      if (!tasksByMember.has(memberId)) {
        tasksByMember.set(memberId, [])
      }
      tasksByMember.get(memberId)!.push(entry)
    }

    const summaries = members.map((member) => {
      const memberId = normalizeObjectId(member._id) ?? ""
      return {
        member_id: memberId,
        name: member.name,
        role: member.role,
        capacity: member.capacity,
        used_capacity: member.used_capacity,
        tasks: tasksByMember.get(memberId) || [],
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Member summaries retrieved successfully",
        results: summaries,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error building member summaries", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to build member summaries",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}

