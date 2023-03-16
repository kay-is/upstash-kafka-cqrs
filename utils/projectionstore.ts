import type { Task } from "@/schema/typedefs"
import type { TaskEvent } from "./eventstore"
import { Redis } from "@upstash/redis"

export class ProjectionStore {
  private redisClient = Redis.fromEnv()

  async processEvents(events: TaskEvent[]) {
    console.log("Processing events...")
    if (events.length === 0) return console.log("No events to process!")

    const pipeline = this.redisClient.pipeline()
    for (let event of events) {
      switch (event.type) {
        case "create-task":
          console.log("Create event found!")
          pipeline.set(event.data.id, event.data)
          pipeline.sadd("tasks", event.data.id)
          break
        case "update-task":
          console.log("Update event found!")
          pipeline.set(event.data.id, event.data)
          break
        case "delete-task":
          console.log("Delete event found!")
          pipeline.srem("tasks", event.data.id)
          pipeline.del(event.data.id)
          break
      }
    }

    const offset = events[events.length - 1].offset + 1
    pipeline.set("lastOffset", offset)

    await pipeline.exec()

    console.log("Events processed!")
  }

  async loadOffset(): Promise<number> {
    const pipeline = await this.redisClient.pipeline()
    pipeline.set("cacheBuster", Math.random())
    pipeline.get("lastOffset")
    const results = await pipeline.exec<number[]>()

    return results.pop() ?? 1
  }

  async loadTasks(): Promise<Task[]> {
    const taskIds = await this.redisClient.smembers("tasks")

    const pipeline = this.redisClient.pipeline()
    for (let taskId of taskIds) pipeline.get(taskId)

    return await pipeline.exec()
  }
}
