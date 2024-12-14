import { Hono } from "hono";
import { upgradeWebSocket } from "hono/deno";
import { WebSocketService } from "./web-socket-service.ts";
import { initMessageParser, messageParserErrorCodes } from "./message-parser.ts";
import { logger } from "./logger.ts";
import { db } from "./db.ts";
import { messages } from "../drizzle/schema.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello World!");
});

const webSocketService = new WebSocketService();

app.get(
  "/ws/room/:roomId",
  upgradeWebSocket((c) => {
    const { roomId } = c.req.param();
    const { fingerprint } = c.req.query();

    const messageParser = initMessageParser(roomId, fingerprint);

    return {
      onOpen(_event, client) {
        webSocketService.addClientToRoom(roomId, fingerprint, client);
      },
      onMessage(event) {
        const rawMessage = event.data.toString();
        const [error, message] = messageParser.parseMessage(rawMessage);
        if (error) {
          logger.error(error.asLogObject());
          webSocketService.sendMessageToRoom(roomId, fingerprint, error.asWebSocketMessage());
        } else if (message){
          webSocketService.sendMessageToRoom(roomId, fingerprint, JSON.stringify({
            success: true,
            message,
          }));
          db.insert(messages).values(message)
            .then(() => {
              logger.debug({
                message: 'saved message to database',
                messageId: message.id,
              });
            })
            .catch((error) => {
              logger.error({
                message: 'failed to save message to database',
                error,
              });
              // TODO: send error to client about db save
            });
        } else {
          const error = messageParser.createError("Message was undefined", messageParserErrorCodes.UNKNOWN_ERROR);
          webSocketService.sendMessageToRoom(roomId, fingerprint, error.asWebSocketMessage());
        }
      },
      onClose: () => {
       webSocketService.removeClientFromRoom(roomId, fingerprint);
      },
    };
  }),
);

export default app;
