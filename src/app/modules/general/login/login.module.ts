import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import {RouterModule, Routes} from '@angular/router';
import {AppSharedModule} from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    AppSharedModule
  ],
  declarations: [
    LoginComponent
  ],
})
export class LoginModule {}
