import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddNoteComponent } from './add-note.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: '', component: AddNoteComponent },
];

@NgModule({
  declarations: [AddNoteComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    RouterModule.forChild(routes)
  ],
})
export class AddNoteModule { }
