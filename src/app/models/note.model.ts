import {Note} from '../../../in/Api';

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
  file = 'file'
}
