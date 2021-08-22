import {Note} from 'in/Api';
import {TagModel} from './tag.model';

export interface NoteModel extends Note {
  id: string;
  type: 'note';
  title?: string;
  text?: string;

  image_url?: string;
}

export interface NoteFileModel {
  id: string;
  src: string;
  loaded: boolean;
  text?: string;
}

export enum ItemType {
  note = 'note',
  tag = 'tag',
  file = 'file',
  image = 'image'
}

// TODO: rename it to ItemWithTags
export type NoteWithTags = (Omit<NoteModel, 'tags'> & {tags: TagModel[]});

export { ObjectId } from 'in/Api';
