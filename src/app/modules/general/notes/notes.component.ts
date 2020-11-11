import {Component, OnDestroy, OnInit} from '@angular/core';
import {fromTopAnimation} from '../../../animations';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, map, shareReplay, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {CrudService} from '../../../services/crud.service';
import {NzMessageService} from 'ng-zorro-antd';
import {TagModel} from '../../../models/tag.model';
import {queryParamsPack, queryParamsUnpack} from 'src/utils/params'
import {NoteModel} from '../../../models/note.model';
import {toArray, truncateForHtml} from '../../../../utils/utils1';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
  providers: [],
  animations: [fromTopAnimation,
    trigger('tagAnimation', [
      transition('void => *', [
        query('div', style({transform: 'translatex(-100%)'})),
        query('div',
          stagger('15ms', [
            animate('220ms', style({transform: 'translateX(0)'}))
          ])
        )
      ])
    ]),
    trigger('noteAnimation', [
      transition('void => *', [
        query('div', style({transform: 'translatex(-100%)'})),
        query('div',
          stagger('10ms', [
            animate('250ms ease-in', style({transform: 'translateX(0)'}))
          ])
        )
      ])
    ])
  ]
})
export class NotesComponent implements OnInit, OnDestroy {

  public tagsLoading: boolean;
  public tags$: Observable<object[]>;
  public searchTags: string[] = [];
  public notesSearchString: string;
  public notes: NoteModel[];

  private unsubscribe$ = new Subject<void>();
  private searchNoteDecouncer$: Subject<string> = new Subject();

  constructor(
    public store: StoreService,
    public action: ActionService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: CrudService,
    private messageService: NzMessageService
  ) {
  }

  public GetMoreNotesData() {
    if (this.store.data.notes.downloadMore) {
      this.action.GetNotes(this.searchTags, this.notesSearchString)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((notes: NoteModel[]) => this.notes = this.notes.concat(notes));
    }
  }

  public ngOnInit(): void {
    this.getTags();
    this.route.queryParams.pipe(
      switchMap((params: Params) => this.getNotes(params)),
      takeUntil(this.unsubscribe$)
    ).subscribe((notes: NoteModel[]) => this.notes = notes);
    this.setupSearchNotesDebouncer();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onSearchNoteInputChange(term: string): void {
    this.searchNoteDecouncer$.next(term);
  }

  private async setupSearchNotesDebouncer() {
    this.searchNoteDecouncer$.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe(async (term: string) => {
      this.notesSearchString = term;
      await this.refresh_url_search();
    });
  }

  public addTag(text: string): void {
    if (!text) {
      this.messageService.error('Название нового тега не может быть пустым!', {nzDuration: 3500});
    } else {
      this.tagsLoading = true;
      this.crudService.AddTag(text).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.getTags();
        // this.store.data.tags.createText = '';
      });
    }
  }

  public deleteTag(id, event): void {
    const r = confirm('Данный тег будет удалён! Вы уверены? (тут конечно будет позже что-то по-красивее :))) )');
    if (r === true) {
      event.stopPropagation();
      this.crudService.DeleteTag(id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.getTags();
        const removedTag = this.searchTags.findIndex((tag: string) => tag === id);
        this.searchTags.splice(removedTag, 1);
        this.refresh_url_search();
      });
    }
  }

  public addNote(): void {
    const queryParams = queryParamsPack({tags: this.searchTags, search: this.notesSearchString});
    this.router.navigate(['/note'], {queryParams});
  }

  async FilterNotesTag(tagId) {
    if (this.searchTags.includes(tagId)) {
      const removedTag = this.searchTags.findIndex((tag: string) => tag === tagId);
      this.searchTags.splice(removedTag, 1);
    } else {
      this.searchTags.push(tagId);
    }
    await this.refresh_url_search();

    // this.crudService.FilterNotes(this.Search).subscribe(data => {this.Notes=data;});
    // this.action.GetNotes();
  }

  NoteSelect(id) {
    this.store.data.note.lastUpdatedId = '';
    this.router.navigate(['/note/' + id]);
  }

  public deleteNote(id, event) {
    event.stopPropagation();
    const r = confirm('Данная заметка будет удалёна! Вы уверены? (тут конечно будет позже что-то по-красивее :))) )');
    if (r) {
      this.crudService.deleteNote(id).pipe(
        switchMap(() => this.route.queryParams),
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        const deletedNote = this.notes.findIndex((note: NoteModel) => note.id === id);
        this.notes.splice(deletedNote, 1);
      });
    }
  }

  // Обновить роут при фильтрации и запросах
  async refresh_url_search() {
    const queryParams = queryParamsPack({tags: this.searchTags, search: this.notesSearchString});
    return this.router.navigate(['/notes'], {queryParams});
  }

  private getTags(): void {
    this.tagsLoading = true;
    this.tags$ = this.crudService.getTags().pipe(
      tap((tags: TagModel[]) => {
        this.store.data.tags.tagsArray = tags;
      }),
      shareReplay(1),
    );
  }

  private getNotes(params: Params): Observable<NoteModel[]> {
    const params1 = queryParamsUnpack(params);
    this.notesSearchString = params1.search || '';
    this.searchTags = params1.tags || [];
    return this.action.GetNotes(params1.tags, params1.search, {refresh: true})
      .pipe(
        map((notes: NoteModel[]) => {
          return notes.map((note: NoteModel) => {
            let urlHtml = '';
            if (note.url) {
              const s1 = toArray(note.url).map((url1) => `<a href=${url1}>${truncateForHtml(url1, 50)}</a>`).join(', ');
              urlHtml = '  (' + s1 + ')';
            }
            return {...note, urlHtml};
          })
        })
      );
  }
}
