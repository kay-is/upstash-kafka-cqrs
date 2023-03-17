import { validate } from "@/utils/notificator"
import { EventStore } from "@/utils/eventstore"
import { ProjectionStore } from "@/utils/projectionstore"

const eventStore = new EventStore()
const projectionStore = new ProjectionStore()

export const POST = validate(async (request: Request) => {
  console.log("[ProjectionHandler] Received notification!")

  const offset = await projectionStore.loadOffset()
  const events = await eventStore.loadEvents(offset)

  await projectionStore.processEvents(events)

  console.log("[ProjectionHandler] Done!")
  return new Response()
})
