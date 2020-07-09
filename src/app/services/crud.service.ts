import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, Observer, of} from 'rxjs';
import { map, debounceTime  } from 'rxjs/operators';
import { secret } from 'src/environments/secret';

export interface ServerResponse {
  id: string;
  title: string;
  type: string;
  text?: string;
  tags?: [];
}

@Injectable({providedIn: 'root'})
export class CrudService {

  constructor(private http: HttpClient) {}

  public urlapi = 'https://ntree.online/proxy/NTreeNotesServer/api';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'X-SourceId': secret.apiTokenId,
    })
  };

  public GetNotes(searchtext, tags_input, begin = 0, countMax = 20): Observable<[]>{
    let tags = Array.from(tags_input);
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'find',
      'object': {},
      'options': {}
    };
    if(tags.length > 0){postBody['object']['tags'] = tags; }
    if (searchtext > ''){postBody['object']['text'] = searchtext; }
    postBody['options']['offset'] = begin;
    postBody['options']['countMax'] = countMax;
    return this.http
      .post(this.urlapi, postBody, this.httpOptions)
      .pipe(map(data => {
        const NoteList = data['object'];
        return NoteList.map(function(note: any) {
            return {
              id: note.id,
              title: note.title,
              type: note.type,
              tags: note.tags,
              text: note.text,
              image_url: (note.image_url === undefined || note.image_url === '') ? '' : `http://ntree.online/${note.image_url}` ,
              ts_updated_ms: note.ts_updated_ms};
        });
    }));
  }

  public GetNote(id): Observable<object>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'read',
      "objectId": [id]
    };
    return this.http
      .post(this.urlapi, postBody, this.httpOptions)
      .pipe(map(data => {

        //console.log(data);
        const Note = data['object'][0];
        return Note;
    }));
  }

  public GetTags(): Observable<[]>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'find',
      'object': {
        'type': 'tag'
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => {
      const TagsList = data['object'];
      return TagsList.map(function(tag: any) {
          return {id: tag.id, title: tag.title, type: tag.type};
      });
    }));
  }

  public AddNote(title, text, tags): Observable<object>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'create',
      "objectId": 'fc3_20200326_XdBAcER1CHo8Y498',
      'object':{
        'type': 'note',
        'title': title,
        'text': text,
        'tags': tags
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => {
      const result = data;
      return result;
    }));
  }

  public UpdateNote(id, title, text, tags, files): Observable<object>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'update',
      "objectId": id,
      'object': {
        'type': 'note',
        'title': title,
        'text': text,
        'files': files,
        'tags': tags
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => {
      const result = data;
      return result;
    }));
  }

  public DeleteNote(id): Observable<boolean>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'delete',
      "objectId": id
    }
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => { if (data['ok'] === true){ return true; } return false; }));
  }

  public DeleteTag(id): Observable<boolean>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'delete',
      "objectId": id
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => {if (data['ok'] === true){ return true; } return false; }));
  }

  public AddTag(text): Observable<boolean>{
    const postBody={
      'namespace': 'NTreeNotes',
      'actionId': 'create',
      'object': {
        'type': 'tag',
        'title': text
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => {if (data['ok'] === true){ return true; } return false; }));
  }

  public UploadFile(formdata): Observable<any>{
    const Upload_Options = {
      headers: new HttpHeaders({
        'X-SourceId': secret.uploadTicketId,
      })
    };
    return this.http.post('https://ntree.online/upload', formdata, Upload_Options)
    .pipe(map(data => { return data; }));
  }

  public SaveFile(Fileid): Observable<object>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'create',
      'object': {
        'id': Fileid,
        'type': 'file',
        'title': Fileid
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => {
      if (data['ok'] === true){
        return data;
      }else{
        return data['ok'] = false;
      }
    }));
  }

  public SaveFileToNote(FileId, NoteId): Observable<object>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'update',
      "objectId": NoteId,
      'object': {
        'files': [FileId]
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => {
      if (data['ok'] === true){
        return data;
      }else{
        return data['ok'] = false;
      }
    }));
  }

  public DeleteFile(FileId): Observable<object>{
    const postBody = {
      'namespace': 'NTreeNotes',
      'actionId': 'delete',
      "objectId": FileId
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
    .pipe(map(data => {
      if (data['ok'] === true){
        return data;
      }else{
        return data['ok'] = false;
      }
    }));
  }
}
