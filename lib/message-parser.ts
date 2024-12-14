import { z } from "zod";
import { messages } from "../drizzle/schema.ts";
import { InferSelectModel } from "drizzle-orm";

type ParsedMessage = InferSelectModel<typeof messages>;

export const messageParserErrorCodes = {
  MALFORMED_MESSAGE: "MALFORMED_MESSAGE",
  INVALID_MESSAGE_SCHEMA: "INVALID_MESSAGE_SCHEMA",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

type MessageParserErrorCode = typeof messageParserErrorCodes[keyof typeof messageParserErrorCodes];

export class MessageParserError extends Error {
  public code: MessageParserErrorCode;

  constructor(message: string, code?: typeof messageParserErrorCodes[keyof typeof messageParserErrorCodes], cause?: unknown) {
    super(message, { cause });
    this.name = "MessageParserError";
    this.code = code || messageParserErrorCodes.UNKNOWN_ERROR;
  }

  asLogObject(debug: boolean = false) {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      cause: debug ? this.cause : undefined,
      stack: debug ? this.stack : undefined,
    }
  }

  asWebSocketMessage() {
    return JSON.stringify({
      success: false,
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        ts: Date.now(),
      },
    });
  }
}

const incomingMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
});

type MessageParserResult = [MessageParserError | null, ParsedMessage | null];

export function initMessageParser(roomId: string, fingerprint: string){
  function parseMessage(messageData: string): MessageParserResult {
    let messageObject: Record<string, unknown>;
    try {
      messageObject = JSON.parse(messageData);
    } catch (e) {
      return [new MessageParserError("Error parsing message JSON", messageParserErrorCodes.MALFORMED_MESSAGE, e), null];
    }

    try {
      const parsedMessage = incomingMessageSchema.parse(messageObject);
      return [null, { 
        ...parsedMessage, 
        roomId,
        sender: fingerprint,
        ts: new Date().toISOString(),
      }];
    } catch (e) {
      console.log(e);
      return [new MessageParserError("Error parsing message JSON", messageParserErrorCodes.INVALID_MESSAGE_SCHEMA, e), null];
    }
  }

  function createError(errorMessage: string, code: MessageParserErrorCode) {
    return new MessageParserError(errorMessage, code);
  }

  return {
    parseMessage,
    createError,
  }
}