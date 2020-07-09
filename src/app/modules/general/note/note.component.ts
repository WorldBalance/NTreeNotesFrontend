import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StoreService } from '../../../services/store.service';
import { ActionService } from '../../../services/action.service';
import { Subscription, Observable, Observer } from 'rxjs';

import { NzMessageService } from 'ng-zorro-antd/message';
import { UploadChangeParam, UploadFile } from 'ng-zorro-antd/upload';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { concatMap } from 'rxjs/operators';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { secret } from 'src/environments/secret';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {
  private routeSubscription: Subscription;

  constructor(
    public store: StoreService,
    public action: ActionService,
    private route: ActivatedRoute,
    private router: Router,
    private msg: NzMessageService
  ) {

    this.routeSubscription = route.params.subscribe(params => {
      this.GetNote(params['id']);
    });

  }

  ngOnInit(): void {

  }

  UpdateNote(){
    this.store.data.note.lastUpdatedId = '';
    this.action.UpdateNote();
  }

  GetNote(id){
    this.action.GetNote(id);
  }

  Cancel(){
    this.store.data.note.lastUpdatedId = '';
    this.router.navigate(['/notes']);
  }

  setMediaUploadHeaders = () => {
    return {
      "X-SourceId": secret.uploadTicketId,
    };
  }

  public setFile(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      alert(event.target.files.length);
    }
  }

  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      const formData = new FormData();
      formData.append('fileData', file);
      this.action.UploadFile(formData);
      observer.complete();
    });
  }

  SaveFile(){
    this.action.SaveFiles();
  }

  DeleteFile(fileId, index){
    this.action.DeleteFile(fileId, index);
  }
}
