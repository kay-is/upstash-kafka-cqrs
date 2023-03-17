import type { Task } from "@/schema/typedefs"
import { notify } from "@/utils/notificator"

export interface TaskEvent {
  type: "create-task" | "update-task" | "delete-task"
  offset: number
  data: Task
}

export class EventStore {
  private producerUrl = `${process.env.UPSTASH_KAFKA_URL}/produce/${process.env.UPSTASH_KAFKA_TOPIC}/`
  private fetchUrl = process.env.UPSTASH_KAFKA_URL + "/fetch/"
  private fetchConfig: RequestInit = {
    cache: "no-store",
    headers: {
      Authorization:
        "Basic " +
        btoa(
          process.env.UPSTASH_KAFKA_USERNAME +
            ":" +
            process.env.UPSTASH_KAFKA_PASSWORD
        ),
    },
  }

  async saveEvent(event: Omit<TaskEvent, "offset">) {
    console.log("[EventStore] Saving Event...")
    await fetch(this.producerUrl + JSON.stringify(event), this.fetchConfig)
    console.log("[EventStore] Event saved!")
    console.log("[EventStore] Notifying other services...")
    await notify()
    console.log("[EventStore] Services notified!")
  }

  async loadEvents(offset: number): Promise<TaskEvent[]> {
    console.log("[EventStore] Loading events at offset " + offset)

    const response = await fetch(this.fetchUrl, {
      ...this.fetchConfig,
      method: "POST",
      body: JSON.stringify({
        topic: process.env.UPSTASH_KAFKA_TOPIC,
        partition: 0,
        offset,
      }),
    })

    const messages: { value: string; offset: number }[] = await response.json()

    console.log("[EventStore] " + messages.length + " events loaded!")
    return messages.map(({ value, offset }) => {
      const event = JSON.parse(value)
      return { ...event, offset }
    })
  }
}
