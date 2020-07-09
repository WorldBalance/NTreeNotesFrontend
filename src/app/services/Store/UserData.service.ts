import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserData{
  constructor(){}

  public isAuthorized = true;
}
