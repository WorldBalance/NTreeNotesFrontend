import { Request as RequestMin, Response as ResponseMin, ObjectId } from "./ApiInterfaceMin";


export type RequestNTreeNotes = "NTreeNotes";
export type TitleUTF8 = string; // in some language
export type URL = string;
export type Action = "create" | "read" | "update" | "delete" | "find";
export type Type = "note" | "tag" | "file" | "unknown";


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
    url?: URL | URL[];
    text?: TitleUTF8;
    user_info?: object;
    image_url?: URL; // out

    // Read Only (RO) properties
    ts_created_ms?: number;
    ts_updated_ms?: number;
}

export interface Note extends Item {
    tags?: ObjectId[];
    files?: ObjectId[];
}

export interface Tag extends Item {
    linksL?: ObjectId[]; // children
    linksH?: ObjectId[]; // parents
}


export type Options = ActionOptions;
export type ActionOptions = ActionFindOptions;

export interface ActionFindOptions {
    offset?: number;
    countMax?: number;

    excludeTags?: ObjectId | ObjectId[];
    includeTagsL?: ObjectId | ObjectId[]; // TagsL = subtags        includes any SubTags of every ObjectId
}


export const sNTreeNotes: RequestNTreeNotes = "NTreeNotes";
export const keyUrl = "url";
export const keyTags = "tags";
export const keyFiles = "files";
export const keyUserInfo = "user_info";
export const keyImageUrl = "image_url";

export {
    ObjectId,
}
