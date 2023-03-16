import { EventStore } from "@/utils/eventstore"
import { ProjectionStore } from "@/utils/projectionstore"
import type {
  CreateTaskInput,
  UpdateTaskInput,
  DeleteTaskInput,
} from "./typedefs"

const eventStore = new EventStore()
const projectionStore = new ProjectionStore()

export const resolvers = {
  Query: {
    async list() {
      return await projectionStore.loadTasks()
    },
  },
  Mutation: {
    async createTask(_: unknown, input: CreateTaskInput) {
      const newTask = {
        ...input,
        id: String(Date.now() + Math.random()),
        done: false,
      }
      await eventStore.saveEvent({ type: "create-task", data: newTask })
      return newTask
    },
    async updateTask(_: unknown, input: UpdateTaskInput) {
      await eventStore.saveEvent({ type: "update-task", data: input })
      return { ...input }
    },
    async deleteTask(_: unknown, input: DeleteTaskInput) {
      await eventStore.saveEvent({
        type: "delete-task",
        data: { id: input.id, text: "", done: false },
      })
      return input.id
    },
  },
}
