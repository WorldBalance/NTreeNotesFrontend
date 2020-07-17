import {NoteModel} from './note.model';
import {TagModel} from './tag.model';

interface CrudOperationModel {
  ok: boolean;
}

export interface DeletionModel extends CrudOperationModel {
  object: { deleted: string[] }
}

export interface CreationModel extends CrudOperationModel {
  objectId: string;
}

export interface GetNotesModel extends CrudOperationModel {
  object: NoteModel[];
}

export interface GetTagsModel extends CrudOperationModel {
  object: TagModel[];
}

interface PostModel {
  namespace: string;
  actionId: string;
  object: unknown;
  options: unknown;
}

export interface PostNotesModel extends PostModel {
  object: { tags: string[], text: string };
  options: { offset: number; countMax: number };
}
