import { NgModule } from '@angular/core';
import { ContactComponent } from './contact.component';
import {RouterModule, Routes} from '@angular/router';
import {AppSharedModule} from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: ContactComponent },
];

@NgModule({
  imports: [
    AppSharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ContactComponent
  ],
})
export class ContactModule { }
