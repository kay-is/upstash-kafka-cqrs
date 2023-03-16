import { EventStore } from "@/utils/eventstore"
import { ProjectionStore } from "@/utils/projectionstore"

const eventStore = new EventStore()
const projectionStore = new ProjectionStore()

export const GET = async (request: Request) => {
  const events = await eventStore.pull()

  await projectionStore.processEvents(events)

  return new Response()
}
