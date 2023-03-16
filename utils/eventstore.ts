import type { Task } from "@/schema/typedefs"

export interface TaskEvent {
  type: "create-task" | "update-task" | "delete-task"
  data: Task
}

export class EventStore {
  private producerUrl = process.env.UPSTASH_KAFKA_URL + "/produce/test/"
  private consumerUrl =
    process.env.UPSTASH_KAFKA_URL + "/consume/default/nextjs-consumer/test"
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

  async push(event: TaskEvent) {
    await fetch(this.producerUrl + JSON.stringify(event), this.fetchConfig)
  }

  async pull(): Promise<TaskEvent[]> {
    console.log("Loading events...")
    let messages: { value: string }[] = []

    for (let tries = 0; tries < 5; ++tries) {
      const response = await fetch(this.consumerUrl, this.fetchConfig)
      messages = await response.json()

      if (messages.length > 0) break
      console.log("No events found. Retrying...")

      await new Promise((r) => setTimeout(r, 1000))
    }

    console.log(messages.length + " events loaded!")
    return messages.map(({ value }) => JSON.parse(value))
  }
}
