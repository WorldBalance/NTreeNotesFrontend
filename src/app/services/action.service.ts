import { Injectable} from '@angular/core';
import { CrudService} from '../services/crud.service';
import { StoreService} from '../services/store.service';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class ActionService {

  constructor(
    private getData: CrudService,
    private message: NzMessageService,
    private store: StoreService,
    private router: Router
  ) { }

  public async appStart(){
    await this.store.StoreRefresh();
    await this.GetTags();
    //await this.GetNotes();
  }

  Get_Tag_from_Id(id: string){
    if (this.store.data.tags.tagsArray === [] || id === '' || id === undefined ){ return null; }
    if (id === 'st_hsIm'){ return null;}
    try{
      const data = this.store.data.tags.tagsArray.find( (x: any) => x.id === id);
      return data['title'];
    }catch {
     return 'ошибка системы! Тег был удалён! ';
    }
  }

  public async GetTags(){
    this.store.data.tags.isDownloadTags = true;
    const promise = new Promise((resolve, reject) => {
      this.getData.GetTags().subscribe(data => {
        this.store.data.tags.tagsArray = data;
        this.store.data.tags.isDownloadTags = false;
        resolve();
      });
    });
    return await promise;
  }

  public async GetNotes(refresh = false){
    this.store.data.RefreshNotesList();
    if (this.store.data.notes.notesArray.length === 0 ){this.store.data.notes.isDownloadNotes = true; }
    const promise = new Promise((resolve, reject) => {
      this.getData.GetNotes(
        this.store.data.notes.searchText,
        this.store.data.notes.searchTags,
        this.store.data.notes.lastNoteIndex,
        this.store.data.notes.countMax)
        .subscribe(data => {
          this.store.data.notes.isDownloadNotes = false;
          if (data.length === 0 && this.store.data.notes.notesArray.length === 0){
            //le.log('первый запрос. Данных вообще нет');
            this.store.data.notes.downloadMore = false;
            resolve(); return; // то "нет записей",то больше не грузить
          }
          if (data.length === 0 ){
            //console.log('не первый запрос. Данных нет');
            this.store.data.notes.downloadMore = false; // если нет записей, но это не первый проход то больше не грузим
            resolve(); return;
          }

          //console.log(data);
          let delParameter = 0;
          if (this.store.data.notes.notesArray.length === 0){
            //console.log('первый запрос');
            if (data.length > 0){
              this.store.data.notes.notesArray.push(...data);
              this.store.data.notes.lastNoteIndex += data.length;
              if (data.length < this.store.data.notes.countMax){this.store.data.notes.downloadMore = false; }
              resolve(); return;
            }
          } else {
            //console.log('последующий запрос');
            delParameter = data.length % this.store.data.notes.notesArray.length - this.store.data.notes.lastNoteIndex;
            //console.log(delParameter);
            if (delParameter < 1){   //Можно ещё грузить
              //console.log("Можно ещё грузить");
              this.store.data.notes.notesArray.push(...data);
              this.store.data.notes.lastNoteIndex += data.length;
              resolve(); return;
            } else{  //достигнут конец
              //console.log("конец конца");
              this.store.data.notes.notesArray.push(...data);
              this.store.data.notes.lastNoteIndex += data.length;
              this.store.data.notes.downloadMore = false;
              resolve(); return;
            }
          }
      });
    });
    return await promise;
  }

  public AddTag(text){
    if (this.store.data.tags.createText === '' || this.store.data.tags.createText === undefined){
      this.message.error('Название нового тега не может быть пустым!', { nzDuration: 3500 }).onClose; return;
    }
    this.getData.AddTag(text).subscribe(data => {
      this.GetTags(); this.store.data.tags.createText = '';
    });
  }

  public GetNote(id){
    this.store.data.note.isDownloadNote = true;
    this.store.data.note.id = '';
    this.store.data.note.title = '';
    this.store.data.note.text = '';
    this.store.data.note.isDownloadNote = true;
    this.store.data.note.tags = [];
    this.store.data.note.FilesArray = [];

    this.getData.GetNote(id).subscribe(data => {
      this.store.data.note.id = data['id'];
      this.store.data.note.title = data['title'];
      this.store.data.note.text = data['text'];
      this.store.data.note.isDownloadNote = false;
      if (data['files'] !== undefined){
        this.store.data.note.FilesArray = data['files'].map((el) => {
          return {
            id: el,
            src: `http://ntree.online/files/NTreeNotes/${el}`,
            loaded: true
          }
        });
      }else{}
      const arr = [];
      data['tags'].forEach((el, index) => {
        if (el === 'st_hsIm' ){
          this.store.data.note.hasAvatar = true;
        }
        else{
          arr.push(el);
        }
      });
      this.store.data.note.tags = arr;
    });
  }

  public async UpdateNote(){
    await this.SaveFiles();
    const filesArr = this.store.data.note.FilesArray.map((el) => {
      return el['id'];
    });
    if (this.store.data.note.hasAvatar){
      this.store.data.note.tags.push('st_hsIm');
    }else{
      console.log('Нет авы')
    }
    console.log(this.store.data.note.hasAvatar);
    console.log(this.store.data.note.tags);
    this.getData.UpdateNote(this.store.data.note.id, this.store.data.note.title, this.store.data.note.text, this.store.data.note.tags, filesArr)
      .subscribe((data) => {
        if (data['ok'] === true){
          this.store.data.note.lastUpdatedId = data['objectId'];
          this.GetNotes();
          this.router.navigate(['/notes']);
          //this.store.data.RefreshNotesList();
        }
        setInterval(() => {
          this.store.data.note.lastUpdatedId = '';
        }, 3000);
    });
  }

  public AddNote(){
    this.getData.AddNote(this.store.data.note.title, this.store.data.note.text, this.store.data.note.tags)
      .subscribe((data) => {
        if (data['ok'] === true){
          this.store.data.note.lastUpdatedId = data['objectId'];
          this.GetNotes();
          this.router.navigate(['/notes']);
        }
      });
  }

  public DeleteNote(id){
    this.getData.DeleteNote(id)
      .subscribe((data) => {
        if (data === true){
          this.GetNotes();
        }
      });
  }

  public DeleteTag(id){
    this.getData.DeleteTag(id).subscribe(data => {
      this.GetTags();
    });
  }

  public UploadFile(formdata){
    this.getData.UploadFile(formdata).subscribe((returningData) => {
      if (returningData['acceptedId'][0] !== undefined){
        this.store.data.note.FilesArray.push({id: returningData['acceptedId'][0], src: `https://ntree.online/uploads/${returningData['acceptedId'][0]}` ,loaded: false, text :'Не сохранено!'});
        this.message.remove();
        this.message.success('Данные загружены', { nzDuration: 1500 }).onClose; return;
      }
      this.message.error('Произошла ошибка. Сервер не ответил, либо проблема с интернет соединением', { nzDuration: 4000 }).onClose; return;
    });
  }

  public async SaveFiles(){
    const promise = new Promise((resolve, reject) => {
      const AddArray = [];
      this.store.data.note.FilesArray.forEach((val, index) => {
        if (!val['loaded']){ AddArray.push(index)}
      });
      if (AddArray.length === 0){ resolve(); return; }
      AddArray.forEach((val, index) => {
        if (!val['loaded']){
          this.getData.SaveFile(this.store.data.note.FilesArray[val]['id']).subscribe((returningData) => {
            if ( returningData['ok'] === false){
              alert('Произошла ошибка! Данные не были записаны либо были записаны некорректно!');
            }
            resolve();
          });
        }
      });
    });
    return promise;
  }

  public DeleteFile(fileId, FileIndex){
    this.getData.DeleteFile(fileId).subscribe((data) => {
      if (data['ok']){
        const deletedId = data['object']['deleted'][0];
        this.store.data.note.FilesArray.splice(FileIndex, 1);
        const filesArr = this.store.data.note.FilesArray.map((el) => {
          return el['id'];
        });
        this.getData.UpdateNote(this.store.data.note.id, '', '', '', filesArr)
        .subscribe((data) => {
          if (data['ok'] === true){
            this.store.data.note.lastUpdatedId = data['objectId'];
          }
        });
      }
    });
  }
}
