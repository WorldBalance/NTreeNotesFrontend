import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {StoreService} from './store.service';
import {NzMessageService} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {CreationModel, ResponseModel, UploadFileModel} from '../models/crud-operations.model';
import {filter, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {NoteFileModel, NoteModel} from '../models/note.model';
import {Observable} from 'rxjs';
import {Note} from './Store/NotesData.service';
import {isEqual} from 'lodash';
import {StaticTag} from '../modules/shared/staticTags.module';
import {Location} from '@angular/common';

@Injectable({providedIn: 'root'})
export class ActionService {

  constructor(
    private getData: CrudService,
    private message: NzMessageService,
    private store: StoreService,
    private router: Router,
    private location: Location,
  ) {
  }

  public async appStart() {
    await this.store.StoreRefresh();
  }

  public getNotes(
    tags: string[], searchString: string, opt?: { refresh?: boolean, excludeTags: string[], includeTagsL?: string[] }
  ): Observable<NoteModel[]> {
    opt && opt.refresh && this.store.data.RefreshNotesList();
    if (!this.store.data.notes.notesArray.length) {
      this.store.data.notes.isDownloadNotes = true;
    }
    const notes$ = this.getData.getItems(
      searchString,
      tags,
      {
        offset: this.store.data.notes.notesArray.length,
        countMax: this.store.data.notes.countMax,
        excludeTags: opt.excludeTags,
        includeTagsL: opt.includeTagsL
      }).pipe(shareReplay(1));
    notes$.subscribe(data => {
      this.store.data.notes.isDownloadNotes = false;
      if (data.length > 0) {
        this.store.data.notes.notesArray.push(...data);
      }
      this.store.data.notes.downloadMore = (data.length === this.store.data.notes.countMax);
    });
    return notes$;
  }

  public GetNote(id): Observable<Note> {
    this.store.data.note.isDownloadNote = true;
    this.store.data.note.id = '';
    this.store.data.note.title = '';
    this.store.data.note.text = '';
    this.store.data.note.files = [];

    return this.getData.GetNote(id).pipe(
      map((note: NoteModel) => {
        return {
          ...note,
          isDownloadNote: false,
          files: note.files ? note.files.map((el: string) => {
            return {
              id: el,
              src: `https://ntree.online/files/NTreeNotes/${el}`,
              loaded: true
            }
          }) : [],
          lastUpdatedId: '',
          hasAvatar: note.tags && note.tags.includes(StaticTag.hasImage0),
          tags: note.tags && note.tags.filter((tag: string) => tag !== StaticTag.hasImage0)
        };
      }),
      tap((note: Note) => this.store.data.note = note)
    );
  }

  public async updateNote(note: NoteModel) {
    await this.SaveFiles();
    const files = this.store.data.note.files.map((el: NoteFileModel) => el.id);
    isEqual(files, note.files) ? (delete note.files) : (note.files = files.length ? files : null);
    this.getData.updateItem(note)
      .pipe(filter((data: CreationModel) => data.ok))
      .subscribe((data) => {
        this.store.data.note.lastUpdatedId = data.objectId;
        this.location.back();
        setInterval(() => {
          this.store.data.note.lastUpdatedId = '';
        }, 3000);
      });
  }

  public UploadFile(formdata) {
    this.getData.UploadFile(formdata).pipe(
      filter((response: UploadFileModel) => response && response.ok)
    ).subscribe((response: UploadFileModel) => {
      this.store.data.note.files.push({
        id: response.acceptedId[0],
        src: `https://ntree.online/uploads/${response.acceptedId[0]}`,
        loaded: false,
        text: 'Не сохранено!'
      });
      this.message.remove();
      this.message.success('Данные загружены', {nzDuration: 1500}).onClose;
    });
  }

  public async SaveFiles() {
    const forUpload = [];
    const files = this.store.data.note.files;
    files.forEach((val: NoteFileModel, index: number) => !val.loaded && forUpload.push(index));
    if (!forUpload.length) {
      return;
    }
    // have files for upload!

    return new Promise((resolve, reject) => {
      let count = 0, countOk = 0;
      forUpload.forEach((index: number) => {
        this.getData.SaveFile(files[index].id).subscribe((returningData: ResponseModel) => {
          count++;
          returningData.ok && countOk++;
          if (count === forUpload.length) { // is the last uploaded file?
            if (countOk === count) { // are all files uploaded ok?
              resolve();
            } else {
              alert('Произошла ошибка! Данные не были записаны либо были записаны некорректно!');
              reject();
            }
          }
        });
      });
    });
  }

  public deleteFile(fileId, FileIndex) {
    this.getData.DeleteFile(fileId).pipe(
      switchMap(() => {
        this.store.data.note.files.splice(FileIndex, 1);
        const filesArr = this.store.data.note.files.map((el: NoteFileModel) => el.id);
        return this.getData.updateItem({
          id: this.store.data.note.id,
          files: filesArr,
          type: 'note',
        });
      }),
      filter((data: CreationModel) => data.ok)
    ).subscribe((data) => this.store.data.note.lastUpdatedId = data.objectId);
  }
}
