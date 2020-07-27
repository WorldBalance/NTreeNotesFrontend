/**
 * Created by Admin on 2020-01-20.
 */

export type ObjectId = string;

// Request
export interface Request {
    namespace?: ObjectId; //
    sourceId?: ObjectId; // (userId, botId, ...)
    actionId?: ObjectId; // (createTitle, ...),
    sequence?: Request[]; // sequence of requests
}
export const keyNamespace = "namespace";
export const keySourceId = "sourceId";
export const keyActionId = "actionId";
export const keySequence = "sequence";

// Response
export interface Response {
    ok: boolean;
    sequence?: Response[]; // sequence of responses
}
export const keyOk = "ok";

export enum ErrorId {
    invalid = 0,
    keyNotFound,
    keyInvalid,
    valueTypeInvalid,
    valueInvalid,
    accessDenied,
    requestInvalid,
    objectIdNotFound,
    objectInvalid,

    // internal error - we have to do something
    actionInvalid,
    unexpectedError,
}

export interface IResponseError extends Response {
    ok: false;
    errorId: string; // AbstractL: ErrorId
    errorMessage: string | object;
    context?: object;
}
export const keyErrorId = "errorId";
export const keyErrorMessage = "errorMessage";
export const keyContext = "context";

export class ResponseError implements IResponseError {
    ok: false;
    errorId: string; // AbstractL: ErrorId
    errorMessage: string | object;
    context?: object;

    constructor(errorId: string, errorMessage: string | object, context?: object) {
        this.ok = false;
        this.errorId = errorId;
        this.errorMessage = errorMessage;
        this.context = context;
    }
}

export type ProcessPacket = (dataIn: Request, options: object) => Promise<Response>;
export interface IProcessPacket {
    processPacket: ProcessPacket;
}
