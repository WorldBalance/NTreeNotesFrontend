import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {
  ActionIds,
  CreationModel,
  DeletionModel,
  GetNotesModel,
  GetTagsModel,
  PostNotesModel,
  RequestModel,
  ResponseModel,
  UploadFileModel
} from '../models/crud-operations.model';
import {TagModel} from '../models/tag.model';
import {ItemType, NoteModel} from '../models/note.model';
import {AuthorizationService} from './authorization.service';
import {NzMessageService} from 'ng-zorro-antd';
import {ActionFindOptions} from '../../../in/Api';

const NAMESPACE = 'NTreeNotes';

@Injectable({providedIn: 'root'})
export class CrudService {

  public urlapi = 'https://ntree.online/proxy/NTreeNotesServer/api';
  public itemType$ = new BehaviorSubject<ItemType>(ItemType.note);

  constructor(private http: HttpClient, private authorizationService: AuthorizationService, private messageService: NzMessageService) {
    globalThis.jdCrudService = this; // DEBUG
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials: true,
  };

  public setItemType(type: ItemType): void {
    this.itemType$.next(type);
  }

  public getItemType(): Observable<ItemType> {
    return this.itemType$.asObservable();
  }

  public getItems(text?: string, tags?: string[], options: ActionFindOptions = {offset: 0, countMax: 20}): Observable<NoteModel[]> {
    const postBody: PostNotesModel = {
      namespace: NAMESPACE,
      actionId: ActionIds.find,
      object: {type: this.itemType$.getValue(), text, tags},
      options
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions).pipe(
      map((data: GetNotesModel) => {
        return data.object.map((note: NoteModel) => {
          return {
            ...note,
            image_url: !note.image_url ? '' : `https://ntree.online/${note.image_url}`,
          };
        });
      }));
  }

  public GetNote(id): Observable<NoteModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.read,
      objectId: [id]
    };
    return this.http
      .post(this.urlapi, postBody, this.httpOptions)
      .pipe(map((data: GetNotesModel) => data.object[0]));
  }

  public getTags(): Observable<TagModel[]> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.find,
      object: {
        type: ItemType.tag
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map((data: GetTagsModel) => data && data.object));
  }

  public addItem(note: NoteModel, files: string[]): Observable<CreationModel> {
    const body: RequestModel = {
      sequence: files.map((file: string) => {
        return {
          namespace: NAMESPACE,
          actionId: ActionIds.create,
          object: {
            id: file,
            type: ItemType.file,
            title: file
          }
        }
      })
    }
    body.sequence.push({
      namespace: NAMESPACE,
      actionId: ActionIds.create,
      object: {
        ...note,
        type: this.itemType$.getValue(),
      }
    })
    return this.http.post(this.urlapi, body, this.httpOptions).pipe(
      filter((data: CreationModel) => data.ok)
    )
  }

  public updateItem(note: NoteModel): Observable<CreationModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.update,
      objectId: note.id,
      object: {
        ...note,
        type: this.itemType$.getValue(),
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<CreationModel>;
  }

  public deleteItem(id): Observable<DeletionModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.delete,
      objectId: id
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions).pipe(filter((data: DeletionModel) => data.ok));
  }

  public addTag(text): Observable<string> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.create,
      object: {
        type: ItemType.tag,
        title: text
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions).pipe(
      filter((result: { objectId: string, ok: boolean }) => {
        if (!result.ok) {
          this.messageService.create('error', 'Ошибка выполнения операции \'создать тег\'');
        }
        return result.ok;
      }),
      map((result: { objectId: string, ok: boolean }) => result.objectId)
    );
  }

  public UploadFile(formdata): Observable<UploadFileModel> {
    const uploadOptions = {
      headers: new HttpHeaders({
        'X-SourceId': this.authorizationService.uploadTicketId,
      })
    };
    return this.http.post('https://ntree.online/upload', formdata, uploadOptions) as Observable<UploadFileModel>;
  }

  public SaveFile(fileId: string): Observable<ResponseModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.create,
      object: {
        id: fileId,
        type: ItemType.file,
        title: fileId
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<ResponseModel>;
  }

  public DeleteFile(FileId): Observable<ResponseModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.delete,
      objectId: FileId
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions).pipe(filter((data: ResponseModel) => data.ok));
  }
}
