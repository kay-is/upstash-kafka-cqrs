export const typeDefs = `#graphql
  type Task {
    id: String!
    text: String!
    done: Boolean!
  }

  type Query {
    list: [Task]
  }

  type Mutation {
    createTask(text: String!): Task
    updateTask(id: String!, text: String!, done: Boolean!): Task
    deleteTask(id: String!): String
  }
`

export interface Task {
  id: string
  text: string
  done: boolean
}

export interface CreateTaskInput {
  text: string
}
export interface UpdateTaskInput {
  id: string
  text: string
  done: boolean
}
export interface DeleteTaskInput {
  id: string
}
