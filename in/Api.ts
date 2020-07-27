import { Request as RequestMin, Response as ResponseMin, ObjectId } from "./ApiInterfaceMin";


export type RequestNTreeNotes = "NTreeNotes";
export type TitleUTF8 = string; // in some language
export type Action = "create" | "read" | "update" | "delete" | "find";
export type Type = "note" | "tag";


// Request
export interface Request extends RequestMin {
    namespace: RequestNTreeNotes;
    sourceId: ObjectId; // token
    actionId: Action;
    object?: Item | Item[];
    objectId?: ObjectId | ObjectId[];
    options?: Options;
}

// Response
export interface Response extends ResponseMin {}
export interface ResponseOk extends Response {
    object?: Item | Item[];
    objectId?: ObjectId | ObjectId[];
}

export interface Item {
    id?: ObjectId;

    type?: Type;
    title?: TitleUTF8;
    text?: TitleUTF8;

    ts_updated_ms?: number;
    ts_created_ms?: number;

    user_info?: object;
}

export interface Note extends Item {
    tags?: ObjectId[];
    files?: ObjectId[];
}

export interface Tag extends Item {
    linksL?: ObjectId[];
    linksH?: ObjectId[];
}


export type Options = ActionOptions;
export type ActionOptions = ActionFindOptions;

export interface ActionFindOptions {
    offset?: number;
    countMax?: number;
}


export const sNTreeNotes: RequestNTreeNotes = "NTreeNotes";
