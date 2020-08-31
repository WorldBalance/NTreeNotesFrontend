import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {Observable, Observer, Subject} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {CrudService} from '../../../services/crud.service';
import {TagModel} from '../../../models/tag.model';
import {NzSelectComponent} from 'ng-zorro-antd';
import {NoteModel} from '../../../models/note.model';

@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.css']
})
export class NoteFormComponent implements OnInit, OnDestroy {

  public currentNote: NoteModel;
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
    this.store.data.note.title = '';
    this.store.data.note.text = '';
    this.tags$ = this.crudService.getTags();

    this.activatedRoute.params.pipe(
      filter(params => params.id),
      switchMap(params => {
        this.currentNote = params.id;
        return this.action.GetNote(params.id)
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe((note: NoteModel) => this.currentNote = note);
  }

  public addNote(): void {
    if (this.currentNote) {
      this.store.data.note.lastUpdatedId = '';
      this.action.updateNote(this.selectComponent.value);
    } else {
      if (!this.store.data.note.text) {
        alert('Введите сперва текст заметки!');
      } else {
        this.action.addNote(this.selectComponent.value);
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
