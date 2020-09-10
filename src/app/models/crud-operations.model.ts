import {NoteModel} from './note.model';
import {TagModel} from './tag.model';

export interface ResponseModel {
  ok: boolean;
  errorId?: string;
  errorMessage?: string;
  context?: unknown;
  sequence?: ResponseModel[];
}

export interface DeletionModel extends ResponseModel {
  object: { deleted: string[] };
  sequence?: DeletionModel[];
}

export interface CreationModel extends ResponseModel {
  objectId: string;
  sequence?: CreationModel[];
}

export interface GetNotesModel extends ResponseModel {
  object: NoteModel[];
  sequence?: GetNotesModel[]
}

export interface GetTagsModel extends ResponseModel {
  object: TagModel[];
  sequence?: GetNotesModel[];
}

export interface UploadFileModel extends ResponseModel {
  acceptedId: string[];
  sequence?: UploadFileModel[];
}

export interface PostNotesModel extends RequestModel {
  object: { type?: string, text?: string, tags?: string[] };
  options: { offset: number; countMax: number };
  sequence?: PostNotesModel[];
}

export interface RequestModel {
  namespace?: string;
  actionId?: string;
  sequence?: RequestModel[];
  object?: unknown;
  options?: unknown;
}

export enum ActionIds {
  create = 'create',
  find = 'find',
  read = 'read',
  update = 'update',
  delete = 'delete'
}
