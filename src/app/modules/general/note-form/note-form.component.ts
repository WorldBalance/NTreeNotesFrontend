import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {StoreService} from '../../../services/store.service';
import {ActionService, AVATAR_TAG} from '../../../services/action.service';
import {iif, Observable, Observer, of, Subject} from 'rxjs';
import {filter, switchMap, takeUntil, pluck, tap} from 'rxjs/operators';
import {CrudService} from '../../../services/crud.service';
import {Note} from 'src/app/services/Store/NotesData.service';
import {CreationModel} from '../../../models/crud-operations.model';
import {NoteFileModel, NoteModel} from '../../../models/note.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.css']
})
export class NoteFormComponent implements OnInit, OnDestroy {

  public initialNote: Note;
  public form: FormGroup;
  public noteId: string;

  private unsubscribe$ = new Subject<void>();

  constructor(
    public store: StoreService,
    public action: ActionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private crudService: CrudService,
    protected formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.store.data.note.title = this.store.data.note.text = '';
    this.store.data.note.files = [];

    this.initForm();
    this.activatedRoute.params.pipe(
      pluck('id'),
      tap((id: string) => this.noteId = id),
      filter((id: string) => !!id),
      switchMap((id: string) => this.action.GetNote(id)),
      takeUntil(this.unsubscribe$)
    ).subscribe((note: Note) => {
      this.initialNote = note;
      this.form.patchValue({
        title: note.title,
        text: note.text,
        tags: note.tags,
        hasAvatar: note.hasAvatar,
        id: note.id,
        withUrl: !!(Array.isArray(note.url) || note.url)
      });
      if ((Array.isArray(note.url) && note.url.length) || note.url) {
        this.form.setControl('url',
          this.formBuilder.control(Array.isArray(note.url) ? note.url.join('\n') : note.url));
      }
    });
  }

  public addNote(): void {
    const value = this.form.value;
    let url = (value.url && value.url.split('\n')) || '';
    if (url && url.length <= 1) {
      url = url[0] || '';
    }
    if (value.id) {
      this.updateNote(value, url);
    } else {
      const files = this.store.data.note.files;
      const filesIds = files.map((file: NoteFileModel) => file.id);
      this.crudService.addNote({...value, url}, filesIds)
        .pipe(
          switchMap((data: CreationModel) => {
            const newNoteId = data.sequence[data.sequence.length - 1].objectId;
            data.sequence.pop();
            const newFilesIds = data.sequence.map((response: CreationModel) => response.objectId);
            value.hasAvatar && value.tags.push('st_hsIm');
            return iif(
              () => !!files.length,
              this.crudService.updateNote({...value, files: newFilesIds, id: newNoteId}),
              of(data)
            )
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: CreationModel) => {
          this.store.data.note.lastUpdatedId = data.objectId;
          this.router.navigate(['/notes']);
        })
    }
  }

  public cancel(): void {
    this.store.data.note.lastUpdatedId = '';
    this.router.navigate(['/notes']);
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public deleteFile(fileId, index): void {
    this.action.deleteFile(fileId, index);
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      text: ['', Validators.required],
      tags: [[]],
      hasAvatar: false,
      id: '',
      withUrl: false
    });

    this.form.controls.withUrl.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe(newValue => {
        if (newValue) {
          this.form.setControl('url', this.formBuilder.control(''));
        } else {
          this.form.patchValue({url: ''});
          this.form.removeControl('url');
        }
      })
  }

  private updateNote(value: NoteModel & { hasAvatar: boolean }, url: string | string[]): void {
    this.store.data.note.lastUpdatedId = '';
    const updatedNote = {} as NoteModel;
    Object.keys(value).forEach((key: string) => {
      if (Array.isArray(value[key]) || value[key] !== this.initialNote[key]) {
        updatedNote[key] = value[key]
      }
    });
    const initialNoteUrl = Array.isArray(this.initialNote.url) ? this.initialNote.url.join('\n') : this.initialNote.url;
    (initialNoteUrl === url) ? delete updatedNote.url : updatedNote.url = url;
    if ((this.initialNote.hasAvatar === value.hasAvatar) &&
      (JSON.stringify(this.initialNote.tags) === JSON.stringify(updatedNote.tags))) {
      delete updatedNote.tags;
    } else if (value.hasAvatar){
      updatedNote.tags.push(AVATAR_TAG);
    }
    this.action.updateNote({...updatedNote, id: value.id});
  }

  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      const formData = new FormData();
      formData.append('fileData', file);
      this.action.UploadFile(formData);
      observer.complete();
    });
  }
}
