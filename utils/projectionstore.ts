import type { Task } from "@/schema/typedefs"
import type { TaskEvent } from "./eventstore"
import { Redis } from "@upstash/redis"

export class ProjectionStore {
  private redisClient = Redis.fromEnv()

  async processEvents(events: TaskEvent[]) {
    console.log("[ProjectionStore] Processing events...")
    if (events.length === 0)
      return console.log("[ProjectionStore] No events to process!")

    const pipeline = this.redisClient.pipeline()
    for (let event of events) {
      switch (event.type) {
        case "create-task":
          console.log(
            "[ProjectionStore] Creating new task with ID: " + event.data.id
          )
          pipeline.set(event.data.id, event.data)
          pipeline.sadd("tasks", event.data.id)
          break
        case "update-task":
          console.log(
            "[ProjectionStore] Updating task with ID: " + event.data.id
          )
          pipeline.set(event.data.id, event.data)
          break
        case "delete-task":
          console.log(
            "[ProjectionStore] Deleting task with ID: " + event.data.id
          )
          pipeline.srem("tasks", event.data.id)
          pipeline.del(event.data.id)
          break
      }
    }

    console.log("[ProjectionStore] Upading offset...")
    const offset = events[events.length - 1].offset + 1
    pipeline.set("lastOffset", offset)

    await pipeline.exec()

    console.log("[ProjectionStore] Events processed!")
  }

  async loadOffset(): Promise<number> {
    console.log("[ProjectionStore] Loading offset...")
    const pipeline = await this.redisClient.pipeline()
    pipeline.set("cacheBuster", Math.random())
    pipeline.get("lastOffset")
    const results = await pipeline.exec<number[]>()

    const offset = results.pop()

    if (!offset) {
      console.log("[ProjectionStore] No offset found! Starting from 1.")
      return 1
    }

    console.log("[ProjectionStore] Offset at " + offset)
    return offset
  }

  async loadTasks(): Promise<Task[]> {
    console.log("[ProjectionStore] Loading tasks...")

    let pipeline = this.redisClient.pipeline()
    pipeline.set("cacheBuster", Math.random())
    pipeline.smembers("tasks")
    const [_, taskIds] = await pipeline.exec<[string, string[]]>()

    pipeline = this.redisClient.pipeline()
    for (let taskId of taskIds) pipeline.get(taskId)

    pipeline.set("cacheBuster", Math.random())

    const tasks = await pipeline.exec<Task[]>()

    tasks.pop()

    console.log("[ProjectionStore] " + tasks.length + " tasks loaded!")
    return tasks
  }
}
