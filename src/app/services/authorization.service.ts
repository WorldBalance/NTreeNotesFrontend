import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UserInfoModel} from '../models/user-info.model';
import {tap} from 'rxjs/operators';

const NAMESPACE = 'NTree';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  public uploadTicketId: string;
  private readonly authorizationUrl = 'https://ntree.online/testApi/api';

  constructor(private http: HttpClient) {
  }

  public getUserInfo(): Observable<UserInfoModel> {
    return this.http.get(this.authorizationUrl, {
      params: {
        ver: '1',
        namespace: NAMESPACE,
        actionId: 'getUserInfo',
        'object[photo_url]': '1',
        'object[uploadTicketId]': '1'
      },
      withCredentials: true
    }).pipe(
      tap((info: UserInfoModel) => this.uploadTicketId = info && info.object && info.object.uploadTicketId),
    ) as Observable<UserInfoModel>;
  }

  public async login() {
    const currentUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `https://ntree.online/login?url_local=${currentUrl}`;
  }

  public async logout(): Promise<any> {
    return this.http.get("https://ntree.online/logout?res=ok", {
      withCredentials: true
    }).toPromise();
  }

}
