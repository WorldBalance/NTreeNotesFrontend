export interface NoteModel {
  id: string;
  type: 'note';
  title: string;
  ts_created_ms?: string;
  ts_updated_ms: string,
  text: string;
  tags: string[];
  files?: string[];
  image_url: string
}

export interface NoteFileModel {
  id: string;
  src: string;
  loaded: boolean;
  text?: string;
}
