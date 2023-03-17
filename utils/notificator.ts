import { Client, Receiver } from "@upstash/qstash"

export const notify = async () => {
  console.log("[Notifier] Sending notification...")
  const qstashClient = new Client({ token: process.env.QSTASH_TOKEN! })
  await qstashClient.publish({
    topic: process.env.QSTASH_TOPIC!,
    body: String(Math.random()),
    headers: {
      content: "application/json",
    },
  })
  console.log("[Notifier] Notification sent!")
}

type RequestHandler = (request: Request) => Promise<Response>
export const validate = (handler: RequestHandler) => {
  const qstashReceiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  })

  return async (request: Request) => {
    console.log("[Notifier] Validating request...")
    const isValid = await qstashReceiver.verify({
      signature: request.headers.get("upstash-signature")!,
      body: await request.text(),
    })

    if (!isValid) {
      console.log("[Notifier] Request invalid! Caller unauthorized.")
      return new Response("Unauthorized", {
        status: 401,
        statusText: "Unauthorized",
      })
    }

    console.log("[Notifier] Request valid!")
    return await handler(request)
  }
}
