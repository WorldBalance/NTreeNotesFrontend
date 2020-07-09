import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddNoteComponent } from './add-note.component';
import { AddNoteRoutingModule } from './add-note.routing.module';
import { NzSelectModule } from 'ng-zorro-antd/select';

@NgModule({
  declarations: [AddNoteComponent],
  imports: [
    CommonModule,
    AddNoteRoutingModule,
    FormsModule,
    NzSelectModule
  ],
  providers: []
})
export class AddNoteModule { }
