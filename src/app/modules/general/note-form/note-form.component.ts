import {Component, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {iif, Observable, Observer, of, Subject} from 'rxjs';
import {switchMap, takeUntil, pluck, tap} from 'rxjs/operators';
import {CrudService} from '../../../services/crud.service';
import {Note} from 'src/app/services/Store/NotesData.service';
import {CreationModel} from '../../../models/crud-operations.model';
import {NoteFileModel, NoteModel} from '../../../models/note.model';
import {QueryParamsPacked, queryParamsUnpack} from 'src/utils/params';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {cloneDeep, isEqual} from 'lodash';
import {StaticTag} from '../../shared/staticTags.module';
import {pushUniqueValue} from '../../../../utils/utils1';

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
    protected formBuilder: FormBuilder,
    private location: Location,
  ) {
  }

  ngOnInit(): void {
    this.store.data.note.title = this.store.data.note.text = '';
    this.store.data.note.files = [];

    this.initForm();

    this.activatedRoute.params.pipe(
      pluck('id'),
      tap((id: string) => this.noteId = id),
      switchMap(
        (id: string) => {
          return iif(
            () => !!id,
            this.action.GetNote(id),
            this.activatedRoute.queryParams
          )
        }
      ),
      takeUntil(this.unsubscribe$)
    ).subscribe((note: (Note | QueryParamsPacked)) => {
      if (this.noteId) {
        this.initialNote = cloneDeep({...note as Note, tags: note.tags || []});
        this.form.patchValue({
          title: this.initialNote.title,
          text: this.initialNote.text,
          tags: this.initialNote.tags,
          hasAvatar: this.initialNote.hasAvatar,
          id: this.initialNote.id,
          withUrl: !!(Array.isArray(this.initialNote.url) || this.initialNote.url),
          url: Array.isArray(this.initialNote.url) ? this.initialNote.url.join('\n') : (this.initialNote.url || null)
        });
      } else {
        const params1 = queryParamsUnpack(note as QueryParamsPacked);
        if (params1.search) {
          this.form.patchValue({
            title: params1.search
          })
        }
        if (params1.tags) {
          this.form.patchValue({
            tags: params1.tags
          })
        }
      }
    });
  }

  public addNote(): void {
    const value = this.form.value;
    let url = (value.url && value.url.split('\n')) || null;
    if (url && url.length <= 1) {
      url = url[0] || null;
    } else if (url) {
      url = (url as string[]).filter((part: string) => !!part);
    }
    if (value.id) {
      this.updateNote(value, url);
    } else {
      const files = this.store.data.note.files;
      const filesIds = files.map((file: NoteFileModel) => file.id);
      value.hasAvatar && pushUniqueValue(value.tags, StaticTag.hasImage0);
      Object.entries(value).forEach(([key, object]: [string, unknown]) => {
        if ((typeof object !== 'boolean' && !object) || (Array.isArray(object) && !object.length)) {
          delete value[key];
        }
      });
      delete value.hasAvatar;
      delete value.withUrl;
      url && (value.url = url);
      this.crudService.addItem(value, filesIds)
        .pipe(
          switchMap((data: CreationModel) => {
            const newNoteId = data.sequence[data.sequence.length - 1].objectId;
            data.sequence.pop();
            const newFilesIds = data.sequence.map((response: CreationModel) => response.objectId);
            return iif(
              () => !!files.length,
              this.crudService.updateItem({...value, files: newFilesIds, id: newNoteId}),
              of(data)
            )
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: CreationModel) => {
          this.store.data.note.lastUpdatedId = data.objectId;
          this.returnPage();
        })
    }
  }

  public cancel(): void {
    this.store.data.note.lastUpdatedId = '';
    this.returnPage();
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
      text: '',
      tags: [[]],
      hasAvatar: false,
      id: '',
      withUrl: false,
      url: null,
    });
  }

  private updateNote(value: NoteModel & { hasAvatar: boolean }, url: string | string[]): void {
    this.store.data.note.lastUpdatedId = '';
    const updatedNote: NoteModel = Object.keys(value)
      .filter((key: string) => key !== 'hasAvatar' && key !== 'withUrl')
      .reduce((acc: NoteModel, key: string) => {
        if (Array.isArray(value[key]) || value[key] !== this.initialNote[key]) {
          acc[key] = value[key]
        }
        return acc;
      }, {} as NoteModel);
    if ((Array.isArray(this.initialNote.url) && Array.isArray(url) && isEqual(this.initialNote.url.sort(), url.sort()))
      || (this.initialNote.url || null) === url) {
      delete updatedNote.url;
    } else {
      updatedNote.url = url;
    }
    if ((this.initialNote.hasAvatar === value.hasAvatar) && isEqual(this.initialNote.tags.sort(), updatedNote.tags.sort())) {
      delete updatedNote.tags;
    } else if (value.hasAvatar) {
      pushUniqueValue(updatedNote.tags, StaticTag.hasImage0);
    } else if(!updatedNote.tags.length) {
      updatedNote.tags = null;
    }
    updatedNote.files = this.initialNote.files.map((file: NoteFileModel) => file.id);

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

  /* context: <textarea formControlName="text">
  want: ([nzAutosize]="{minRows: 2}")
  have: ((https://github.com/NG-ZORRO/ng-zorro-antd/issues/6403), (rows="{{textRowsCountGet()}}))
  */
  public textRowsCountGet(): number {
    const text = this.form.controls["text"]?.value;
    return text && (text.match(/\n/g) || []).length || 2;
  }

  public returnPage(){
    this.location.back();
  }
}
