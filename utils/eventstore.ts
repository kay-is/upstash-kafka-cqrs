import type { Task } from "@/schema/typedefs"

export interface TaskEvent {
  type: "create-task" | "update-task" | "delete-task"
  offset: number
  data: Task
}

export class EventStore {
  private producerUrl = process.env.UPSTASH_KAFKA_URL + "/produce/test/"
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
    await fetch(this.producerUrl + JSON.stringify(event), this.fetchConfig)
  }

  async loadEvents(offset: number): Promise<TaskEvent[]> {
    console.log("Loading events at offset " + offset)

    const response = await fetch(this.fetchUrl, {
      ...this.fetchConfig,
      method: "POST",
      body: JSON.stringify({ topic: "test", partition: 0, offset }),
    })

    const messages: { value: string; offset: number }[] = await response.json()

    console.log(messages.length + " events loaded!")
    return messages.map(({ value, offset }) => {
      const event = JSON.parse(value)
      return { ...event, offset }
    })
  }
}
