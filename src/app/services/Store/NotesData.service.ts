import { Injectable } from '@angular/core';
import {TagModel} from '../../models/tag.model';
import {NoteFileModel} from '../../models/note.model';

class Tags {
  public createText = '';
  public tagsArray: Array<TagModel> = [];
}

export class Note {
  public id = '';
  public title = '';
  public text = '';
  public tags: Array<string> = [];
  public isDownloadNote = true;
  public lastUpdatedId = '';
  public files: Array<NoteFileModel> = [];
  public hasAvatar = false;
}

class Notes {
  public createTags: Array<object> = [];
  public notesArray: Array<any> = [];
  public isDownloadNotes = true;
  public lastNoteIndex = 0;
  public countMax = 15;
  public downloadMore = true;
}


@Injectable({
  providedIn: 'root'
})
export class NotesData{
  public tags: Tags;
  public notes: Notes;
  public note: Note;

  constructor(){
    this.tags = new Tags();
    this.notes = new Notes();
    this.note = new Note();
  }

  public RefreshNotesList(){
    this.notes.createTags = [];
    this.notes.notesArray  = [];
    this.notes.lastNoteIndex = 0;
    this.notes.countMax = 15;
    this.notes.downloadMore = true;
  }
}
