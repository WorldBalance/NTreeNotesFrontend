import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesComponent } from './notes.component';
import { SearchTagPipe } from './search-tag.pipe';
import { TextContentTruncate } from './TextTruncate.pipe';
import { NgZorroAntdModule} from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: '', component: NotesComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    NzIconModule,
    NgxInfiniteScrollerModule,
    InfiniteScrollModule,
    DragDropModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    NotesComponent,
    SearchTagPipe,
    TextContentTruncate
  ],
})
export class NotesModule { }
