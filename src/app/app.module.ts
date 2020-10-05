import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import { StoreService } from './services/store.service';
import { CrudService } from './services/crud.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageModule } from 'ng-zorro-antd/message';

import en from '@angular/common/locales/en';
import { HeaderComponent } from './components/header/header.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {AuthInterceptor} from './services/auth-interceptor.service';
import { createGlobalThis } from '../utils/utils1';


registerLocaleData(en);
!globalThis && createGlobalThis();


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgZorroAntdModule,
    NzSelectModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    DragDropModule,
    NzTabsModule,
    NzBadgeModule,
    NzMessageModule
  ],
  providers: [StoreService, CrudService, { provide: NZ_I18N, useValue: en_US },
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
