import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UserInfoModel} from '../models/user-info.model';

const NAMESPACE = 'NTree';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  private readonly authorizationUrl = 'https://ntree.online/testApi/api';

  constructor(private http: HttpClient) {
  }

  public getUserInfo(): Observable<UserInfoModel> {
    return this.http.get(this.authorizationUrl, {
      params: {
        ver: '1', namespace: NAMESPACE, actionId: 'getUserInfo', 'object[photo_url]': '1'
      },
      withCredentials: true
    }) as Observable<UserInfoModel>;
  }
}
