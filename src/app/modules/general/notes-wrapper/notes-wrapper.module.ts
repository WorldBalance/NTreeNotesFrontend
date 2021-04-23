import { NgModule } from '@angular/core';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {RouterModule, Routes} from '@angular/router';
import {AppSharedModule} from '../../shared/shared.module';
import {NotesWrapperComponent} from './notes-wrapper.component';
import {ItemsViewComponent} from '../items-view/items-view.component';
import {NotesComponent} from "../notes/notes.component";

const routes: Routes = [
  { path: '', component: NotesWrapperComponent },
];

@NgModule({
  imports: [
    NgxInfiniteScrollerModule,
    InfiniteScrollModule,
    DragDropModule,
    RouterModule.forChild(routes),
    AppSharedModule,
  ],
  declarations: [
    NotesWrapperComponent,
    ItemsViewComponent,
    NotesComponent,
  ],
})
export class NotesWrapperModule { }
