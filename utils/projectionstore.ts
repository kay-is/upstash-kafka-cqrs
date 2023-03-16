import type { Task } from "@/schema/typedefs"
import type { TaskEvent } from "./eventstore"
import { Redis } from "@upstash/redis"

export class ProjectionStore {
  private redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  })

  async processEvents(events: TaskEvent[]) {
    console.log("Processing events...")
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

    await pipeline.exec()
    console.log("Events processed!")
  }

  async loadTasks(): Promise<Task[]> {
    const taskIds = await this.redisClient.smembers("tasks")
    const pipeline = this.redisClient.pipeline()

    for (let taskId in taskIds) pipeline.get(taskId)

    const results = await pipeline.exec()

    //@ts-expect-error
    return results.map((r) => r.result)
  }
}
