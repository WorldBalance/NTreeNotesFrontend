import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddNoteComponent } from './add-note.component';


const routes: Routes = [
  { path: '', component: AddNoteComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddNoteRoutingModule { }
