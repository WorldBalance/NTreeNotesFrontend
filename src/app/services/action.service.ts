import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {StoreService} from './store.service';
import {NzMessageService} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {CreationModel, DeletionModel, UploadFileModel} from '../models/crud-operations.model';
import {filter, switchMap, tap} from 'rxjs/operators';
import {NoteFileModel, NoteModel} from '../models/note.model';
import {Observable} from 'rxjs';

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
    if (id === 'st_hsIm') {
      return null;
    }
    try {
      const data = this.store.data.tags.tagsArray.find((x: any) => x.id === id);
      return data['title'];
    } catch {
      return 'ошибка системы! Тег был удалён! ';
    }
  }

  public async GetNotes(tags: string[], searchString: string, opt?: { refresh?: boolean }) {
    opt && opt.refresh && this.store.data.RefreshNotesList();
    if (this.store.data.notes.notesArray.length === 0) {
      this.store.data.notes.isDownloadNotes = true;
    }
    const promise = new Promise((resolve, reject) => {
      this.getData.GetNotes(
        searchString,
        tags,
        this.store.data.notes.lastNoteIndex,
        this.store.data.notes.countMax)
        .subscribe(data => {
          this.store.data.notes.isDownloadNotes = false;
          if (!data.length) {
            this.store.data.notes.downloadMore = false; // если нет записей, то больше не грузим
            resolve();
            return;
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
                resolve();
                return;
              }
            } else {
              // console.log('последующий запрос');
              delParameter = data.length % this.store.data.notes.notesArray.length - this.store.data.notes.lastNoteIndex;
              this.store.data.notes.notesArray.push(...data);
              this.store.data.notes.lastNoteIndex += data.length;
              if (delParameter >= 1) {// достигнут конец
                this.store.data.notes.downloadMore = false;
              }
              resolve();
              return;
            }
          }
        });
    });
    return await promise;
  }

  public GetNote(id): Observable<NoteModel> {
    this.store.data.note.isDownloadNote = true;
    this.store.data.note.id = '';
    this.store.data.note.title = '';
    this.store.data.note.text = '';
    this.store.data.note.FilesArray = [];

    return this.getData.GetNote(id).pipe(
      tap((note: NoteModel) => {
        this.store.data.note = {
          ...note,
          isDownloadNote: false,
          FilesArray: note.files ? note.files.map((el: string) => {
            return {
              id: el,
              src: `http://ntree.online/files/NTreeNotes/${el}`,
              loaded: true
            }
          }) : [],
          lastUpdatedId: note.ts_updated_ms,
          hasAvatar: note.tags.includes('st_hsIm'),
          tags: note.tags.filter((tag: string) => tag !== 'st_hsIm')
        };
      })
    );
  }

  public async updateNote(tags: string[]) {
    await this.SaveFiles();
    const filesArr = this.store.data.note.FilesArray.map((el: NoteFileModel) => el.id);
    this.store.data.note.hasAvatar ? tags.push('st_hsIm') : console.log('Нет авы');

    this.getData.UpdateNote(this.store.data.note.id, this.store.data.note.title, this.store.data.note.text, tags, filesArr)
      .pipe(filter((data: CreationModel) => data.ok))
      .subscribe((data) => {
        this.store.data.note.lastUpdatedId = data.objectId;
        this.router.navigate(['/notes']);
        setInterval(() => {
          this.store.data.note.lastUpdatedId = '';
        }, 3000);
      });
  }

  public addNote(tags: string[]) {
    this.getData.AddNote(this.store.data.note.title, this.store.data.note.text, tags).pipe(
      filter((data: CreationModel) => data.ok)
    ).subscribe((data) => {
      this.store.data.note.lastUpdatedId = data.objectId;
      this.router.navigate(['/notes']);
    });
  }

  public DeleteNote(id, tags: string[], searchString: string) {
    this.getData.DeleteNote(id).pipe(
      filter((data: DeletionModel) => data.ok)
    ).subscribe(() => this.GetNotes(tags, searchString));
  }

  public UploadFile(formdata) {
    this.getData.UploadFile(formdata).pipe(
      filter((response: UploadFileModel) => response && response.ok)
    ).subscribe((response: UploadFileModel) => {
      this.store.data.note.FilesArray.push({
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
    return new Promise((resolve, reject) => {
      const AddArray = [];
      this.store.data.note.FilesArray.forEach((val, index) => {
        if (!val['loaded']) {
          AddArray.push(index)
        }
      });
      if (AddArray.length === 0) {
        resolve();
        return;
      }
      AddArray.forEach((val, index) => {
        if (!val['loaded']) {
          this.getData.SaveFile(this.store.data.note.FilesArray[val]['id']).subscribe((returningData) => {
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
      filter(data => data['ok']),
      switchMap(() => {
        this.store.data.note.FilesArray.splice(FileIndex, 1);
        const filesArr = this.store.data.note.FilesArray.map((el: NoteFileModel) => el.id);
        return this.getData.UpdateNote(this.store.data.note.id, '', '', '', filesArr);
      }),
      filter((data: CreationModel) => data.ok)
    ).subscribe((data) => this.store.data.note.lastUpdatedId = data.objectId);
  }
}
