import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../app/guards/auth-guard.service';

import { HomeComponent } from './modules/general/home/home.component';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {animation: 'HomePageAnimation'}
  },
  {
    path: 'notes',
    canActivate: [AuthGuard],
    data: {animation: 'NotesPageAnimation'},
    loadChildren: () => import('./modules/general/notes/notes.module')
      .then(mod => mod.NotesModule)
  },
  {
    path: 'note/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/general/note/note.module')
      .then(mod => mod.NoteModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./modules/general/about/about.module')
      .then(mod => mod.AboutModule)
  },
  {
    path: 'contacts',
    loadChildren: () => import('./modules/general/contact/contact.module')
      .then(mod => mod.ContactModule)
  },
  {
    path: 'login',
    data: {animation: 'LoginPageAnimation'},
    loadChildren: () => import('./modules/general/login/login.module')
      .then(mod => mod.LoginModule)
  },
  {
    path: 'create',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/general/add-note/add-note.module')
      .then(mod => mod.AddNoteModule)
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
