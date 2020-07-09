import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NotesComponent } from './notes.component';
import { NotesRoutingModule } from './notes-routing.module';
import { SearchTagPipe } from './search-tag.pipe';
import { TextContentTruncate } from './TextTruncate.pipe';
import { NgZorroAntdModule} from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    NotesRoutingModule,
    FormsModule,
    NgZorroAntdModule,
    NzIconModule,
    NgxInfiniteScrollerModule,
    InfiniteScrollModule,
    DragDropModule
  ],
  exports: [
    // NotesComponent
  ],
  declarations: [
    NotesComponent,
    SearchTagPipe,
    TextContentTruncate
  ],
  providers: [

  ]
})
export class NotesModule { }
