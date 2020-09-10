import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {
  ActionIds,
  CreationModel,
  DeletionModel,
  GetNotesModel,
  GetTagsModel,
  PostNotesModel, RequestModel, UploadFileModel
} from '../models/crud-operations.model';
import {TagModel} from '../models/tag.model';
import {NoteModel} from '../models/note.model';
import {AuthorizationService} from './authorization.service';

const NAMESPACE = 'NTreeNotes';

@Injectable({providedIn: 'root'})
export class CrudService {

  public urlapi = 'https://ntree.online/proxy/NTreeNotesServer/api';
  public typeCur = 'note';

  constructor(private http: HttpClient, private authorizationService: AuthorizationService) {
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials: true,
  };

  public GetNotes(text: string, tags: string[], offset = 0, countMax = 20): Observable<NoteModel[]> {
    globalThis.jdCrudService = this; // DEBUG

    const postBody: PostNotesModel = {
      namespace: NAMESPACE,
      actionId: ActionIds.find,
      object: { type: this.typeCur, text, tags },
      options: {offset, countMax}
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
        type: 'tag'
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map((data: GetTagsModel) => data && data.object));
  }

  public addNote(title: string, text: string, tags: string[], files: string[]): Observable<CreationModel> {
    const body: RequestModel = {
      sequence: files.map((file: string) => {
        return {
          namespace: NAMESPACE,
          actionId: ActionIds.create,
          object: {
            id: file,
            type: 'file',
            title: file
          }
        }
      })
    }
    body.sequence.push({
      namespace: NAMESPACE,
      actionId: ActionIds.create,
      object: {
        type: this.typeCur,
        title,
        text,
        tags
      }
    })
    return this.http.post(this.urlapi, body, this.httpOptions).pipe(
      filter((data: CreationModel) => data.ok)
    )
  }

  public UpdateNote(id, title, text, tags, files): Observable<CreationModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.update,
      objectId: id,
      object: {
        type: this.typeCur,
        title,
        text,
        files,
        tags
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<CreationModel>;
  }

  public DeleteNote(id): Observable<DeletionModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.delete,
      objectId: id
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<DeletionModel>;
  }

  public DeleteTag(id): Observable<DeletionModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.delete,
      objectId: id
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<DeletionModel>;
  }

  public AddTag(text): Observable<{ objectId: string, ok: boolean }> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.create,
      object: {
        type: 'tag',
        title: text
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<{ objectId: string, ok: boolean }>;
  }

  public UploadFile(formdata): Observable<UploadFileModel> {
    const uploadOptions = {
      headers: new HttpHeaders({
        'X-SourceId': this.authorizationService.uploadTicketId,
      })
    };
    return this.http.post('https://ntree.online/upload', formdata, uploadOptions) as Observable<UploadFileModel>;
  }

  public SaveFile(Fileid): Observable<object> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.create,
      object: {
        id: Fileid,
        type: 'file',
        title: Fileid
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map(data => {
        if (data['ok']) {
          return data;
        } else {
          return data['ok'] = false;
        }
      }));
  }

  public SaveFileToNote(FileId, NoteId): Observable<object> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.update,
      objectId: NoteId,
      object: {
        files: [FileId]
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map(data => {
        if (data['ok']) {
          return data;
        } else {
          return data['ok'] = false;
        }
      }));
  }

  public DeleteFile(FileId): Observable<object> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: ActionIds.delete,
      objectId: FileId
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map(data => {
        if (data['ok'] === true) {
          return data;
        } else {
          return data['ok'] = false;
        }
      }));
  }
}
