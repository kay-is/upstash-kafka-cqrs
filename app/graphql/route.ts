import { ApolloServer } from "@apollo/server"
import { startServerAndCreateCloudflareWorkersHandler } from "@as-integrations/cloudflare-workers"
import { typeDefs } from "@/schema/typedefs"
import { resolvers } from "@/schema/resolvers"

const graphqlServer = new ApolloServer({
  introspection: true,
  resolvers,
  typeDefs,
})

export const GET = startServerAndCreateCloudflareWorkersHandler(graphqlServer)
export const POST = GET
