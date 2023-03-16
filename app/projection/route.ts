import { EventStore } from "@/utils/eventstore"
import { ProjectionStore } from "@/utils/projectionstore"

const eventStore = new EventStore()
const projectionStore = new ProjectionStore()

export const GET = async (request: Request) => {
  const offset = await projectionStore.loadOffset()
  const events = await eventStore.loadEvents(offset)

  await projectionStore.processEvents(events)

  return new Response()
}
