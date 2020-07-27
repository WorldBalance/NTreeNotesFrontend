import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactComponent } from './contact.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: '', component: ContactComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ContactComponent
  ],
})
export class ContactModule { }
