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

export const AVATAR_TAG = 'st_hsIm';

@Injectable({providedIn: 'root'})
export class ActionService {

  constructor(
    private getData: CrudService,
    private message: NzMessageService,
    private store: StoreService,
    private router: Router
  ) {
  }

  public async appStart() {
    await this.store.StoreRefresh();
  }

  Get_Tag_from_Id(id: string) {
    if (this.store.data.tags.tagsArray === [] || id === '' || id === undefined) {
      return null;
    }
    if (id === AVATAR_TAG) {
      return null;
    }
    try {
      const data = this.store.data.tags.tagsArray.find((x: any) => x.id === id);
      return data.title;
    } catch {
      return 'ошибка системы! Тег был удалён! ';
    }
  }

  public GetNotes(tags: string[], searchString: string, opt?: { refresh?: boolean }): Observable<NoteModel[]> {
    opt && opt.refresh && this.store.data.RefreshNotesList();
    if (!this.store.data.notes.notesArray.length) {
      this.store.data.notes.isDownloadNotes = true;
    }
    const notes$ = this.getData.GetNotes(
      searchString,
      tags,
      this.store.data.notes.lastNoteIndex,
      this.store.data.notes.countMax)
      .pipe(shareReplay(1));
    notes$.subscribe(data => {
      this.store.data.notes.isDownloadNotes = false;
      if (!data.length) {
        this.store.data.notes.downloadMore = false; // если нет записей, то больше не грузим
      } else {
        let delParameter = 0;
        if (!this.store.data.notes.notesArray.length) {
          // console.log('первый запрос');
          if (data.length > 0) {
            this.store.data.notes.notesArray.push(...data);
            this.store.data.notes.lastNoteIndex += data.length;
            if (data.length < this.store.data.notes.countMax) {
              this.store.data.notes.downloadMore = false;
            }
          }
        } else {
          // console.log('последующий запрос');
          delParameter = data.length % this.store.data.notes.notesArray.length - this.store.data.notes.lastNoteIndex;
          this.store.data.notes.notesArray.push(...data);
          this.store.data.notes.lastNoteIndex += data.length;
          if (delParameter >= 1) {// достигнут конец
            this.store.data.notes.downloadMore = false;
          }
        }
      }
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
          hasAvatar: note.tags && note.tags.includes('st_hsIm'),
          tags: note.tags && note.tags.filter((tag: string) => tag !== 'st_hsIm')
        };
      }),
      tap((note: Note) => this.store.data.note = note)
    );
  }

  public async updateNote(note: NoteModel) {
    await this.SaveFiles();
    const files = this.store.data.note.files.map((el: NoteFileModel) => el.id);
    this.getData.updateNote({...note, files})
      .pipe(filter((data: CreationModel) => data.ok))
      .subscribe((data) => {
        this.store.data.note.lastUpdatedId = data.objectId;
        this.router.navigate(['/notes']);
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
    return new Promise((resolve) => {
      const AddArray = [];
      this.store.data.note.files.forEach((val, index) => {
        if (!val['loaded']) {
          AddArray.push(index)
        }
      });
      if (AddArray.length === 0) {
        resolve();
        return;
      }
      AddArray.forEach((val) => {
        if (!val['loaded']) {
          this.getData.SaveFile(this.store.data.note.files[val]['id']).subscribe((returningData) => {
            if (returningData['ok'] === false) {
              alert('Произошла ошибка! Данные не были записаны либо были записаны некорректно!');
            }
            resolve();
          });
        }
      });
    });
  }

  public deleteFile(fileId, FileIndex) {
    this.getData.DeleteFile(fileId).pipe(
      filter((data: ResponseModel) => data.ok),
      switchMap(() => {
        this.store.data.note.files.splice(FileIndex, 1);
        const filesArr = this.store.data.note.files.map((el: NoteFileModel) => el.id);
        return this.getData.updateNote({
          id: this.store.data.note.id,
          files: filesArr,
          type: 'note',
        });
      }),
      filter((data: CreationModel) => data.ok)
    ).subscribe((data) => this.store.data.note.lastUpdatedId = data.objectId);
  }
}
