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
    url?: URL | URL[] | null;
    text?: TitleUTF8 | null;
    location?: Location | Location[] | null;
    user_info?: object | null;

    tags?: ObjectId[] | null;
    files?: ObjectId[] | null;

    // Read Only (RO) properties
    image_url?: URL;

    ts_created_ms?: number;
    ts_updated_ms?: number;
}

export interface Note extends Item {
}

export interface Tag extends Item {
    linksH?: ObjectId[]; // parents
    linksL?: ObjectId[]; // children
}


export type Options = ActionOptions;
export type ActionOptions = ActionFindOptions;

export interface ActionFindOptions {
    offset?: number;
    countMax?: number;

    excludeTags?: ObjectId | ObjectId[];
    includeTagsL?: ObjectId | ObjectId[]; // TagsL = subtags, includes any SubTags of every ObjectId
}

export interface Location {
    longitude: number;
    latitude: number;
}


export const sNTreeNotes: RequestNTreeNotes = "NTreeNotes";
export const keyId = "id";
export const keyType = "type";
export const keyTitle = "title";
export const keyUrl = "url";
export const keyTags = "tags";
export const keyText = "text";
export const keyFiles = "files";
export const keyUserInfo = "user_info";
export const keyImageUrl = "image_url";

export {
    ObjectId,
}
