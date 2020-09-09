import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {iif, Observable, Observer, of, Subject} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {CrudService} from '../../../services/crud.service';
import {TagModel} from '../../../models/tag.model';
import {NzSelectComponent} from 'ng-zorro-antd';
import {Note} from 'src/app/services/Store/NotesData.service';
import {CreationModel} from '../../../models/crud-operations.model';
import {NoteFileModel} from '../../../models/note.model';

@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.css']
})
export class NoteFormComponent implements OnInit, OnDestroy {

  public currentNote = new Note();
  public tags$: Observable<TagModel[]>;

  @ViewChild('nzSelectComponent', {static: false}) private selectComponent: NzSelectComponent;
  private unsubscribe$ = new Subject<void>();

  constructor(
    public store: StoreService,
    public action: ActionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private crudService: CrudService
  ) {
  }

  ngOnInit(): void {
    this.store.data.note.title = this.store.data.note.text = '';
    this.store.data.note.files = [];
    this.tags$ = this.crudService.getTags();

    this.activatedRoute.params.pipe(
      filter(params => params.id),
      switchMap(params => this.action.GetNote(params.id)),
      takeUntil(this.unsubscribe$)
    ).subscribe((note: Note) => this.currentNote = note);
  }

  public addNote(): void {
    if (this.currentNote.id) {
      this.store.data.note.lastUpdatedId = '';
      this.action.updateNote(this.selectComponent.value, this.currentNote.hasAvatar);
    } else {
      if (!this.store.data.note.text) {
        alert('Введите сперва текст заметки!');
      } else {
        const {title, text, files} = this.store.data.note;
        const filesIds = files.map((file: NoteFileModel) => file.id);
        const tags = this.selectComponent.value;
        this.crudService.addNote(title, text, tags, filesIds)
          .pipe(
            switchMap((data: CreationModel) => {
              const newNoteId = data.sequence[data.sequence.length - 1].objectId;
              data.sequence.pop();
              const newFilesIds = data.sequence.map((response: CreationModel) => response.objectId);
              this.currentNote.hasAvatar && tags.push('st_hsIm');
              return iif(
                () => !!files.length,
                this.crudService.UpdateNote(newNoteId, title, text, tags, newFilesIds),
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

  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      const formData = new FormData();
      formData.append('fileData', file);
      this.action.UploadFile(formData);
      observer.complete();
    });
  }
}
