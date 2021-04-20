import { NgModule } from '@angular/core';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {RouterModule, Routes} from '@angular/router';
import {AppSharedModule} from '../../shared/shared.module';
import {ItemsViewComponent} from './items-view.component';

const routes: Routes = [
  { path: '', component: ItemsViewComponent },
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
    ItemsViewComponent
  ],
})
export class ItemsViewModule { }
