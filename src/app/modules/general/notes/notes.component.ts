import {Component, OnDestroy, OnInit} from '@angular/core';
import {fromTopAnimation} from '../../../animations';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {CrudService} from '../../../services/crud.service';
import {NzMessageService} from 'ng-zorro-antd';
import {TagModel} from '../../../models/tag.model';

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
            animate('220ms', style ({transform: 'translateX(0)'}))
          ])
        )
      ])
    ]),
    trigger('noteAnimation', [
      transition('void => *', [
        query('div', style({transform: 'translatex(-100%)'})),
        query('div',
          stagger('10ms', [
            animate('250ms ease-in', style ({transform: 'translateX(0)'}))
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
      this.action.GetNotes(this.searchTags, this.notesSearchString);
    }
  }

  public ngOnInit(): void {
    this.getTags();
    this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe((params: Params) => {
      this.searchTags = [];
      if (params.search) {
        this.notesSearchString = params.search;
      }
      if (params.tags) {
        const data: [] = params.tags.split('-');
        data.shift();
        this.searchTags = data;
      }
      this.action.GetNotes(this.searchTags, this.notesSearchString, { refresh: true });
    });
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
        this.store.data.tags.createText = '';
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
    this.router.navigate(['/note']);
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

  DeleteNote(id, event) {
    event.stopPropagation();
    const r = confirm('Данная заметка будет удалёна! Вы уверены? (тут конечно будет позже что-то по-красивее :))) )');
    if (r === true) {
      this.action.DeleteNote(id, this.searchTags, this.notesSearchString);
    }
  }

  // Обновить роут при фильтрации и запросах
  async refresh_url_search() {
    const promise = new Promise((resolve, reject) => {
      const returnObj = {};
      if (this.notesSearchString) {
        returnObj['search'] = this.notesSearchString;
      }
      if (this.searchTags.length) {
        let result = '';
        this.searchTags.forEach((tag:string) =>{
          result += '-' + tag;
        });
        returnObj['tags'] = result;
      }
      this.router.navigate(['/notes'], {queryParams: returnObj});
      resolve();
    });
    return await promise;
  }

  private getTags(): void {
    this.tagsLoading = true;
    this.tags$ = this.crudService.getTags().pipe(
      tap((tags: TagModel[]) => {
        this.store.data.tags.tagsArray = tags;
      })
    );
  }
}
