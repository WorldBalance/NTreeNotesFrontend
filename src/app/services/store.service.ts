import { Injectable, NgModule } from '@angular/core';

import { UserData } from '../services/Store/UserData.service';
import { NotesData} from '../services/Store/NotesData.service';

@Injectable()
export class StoreService {
  public data: NotesData;
  public user: UserData;

  constructor() {
    this.StoreRefresh();
  }

  public async StoreRefresh(){
    const promise = new Promise((resolve, reject) => {
      this.data = new NotesData();
      this.user = new UserData();
      resolve();
    });
    return await promise;
  }
}
