import { Injectable } from '@angular/core';

class Tags {
  public createText = '';
  public tagssearchtext = '';
  public tagsArray: Array<string> = [];
  public isDownloadTags = true;
}

class Note {
  public id = '';
  public title = '';
  public text = '';
  public tags: Array<string> = [];
  public isDownloadNote = true;
  public lastUpdatedId = '';
  public FilesArray: Array<object> = [];
  public hasAvatar = false;
}

class Notes {
  public createTags: Array<object> = [];
  public notesArray: Array<any> = [];
  public isDownloadNotes = true;
  public searchText = '';
  public searchTags: Set<string> = new Set<string>();
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
    //this.notes.searchText = '';
    this.notes.createTags = [];
    this.notes.notesArray  = [];
    this.notes.lastNoteIndex = 0;
    this.notes.countMax = 15;
    this.notes.downloadMore = true;
  }
}
