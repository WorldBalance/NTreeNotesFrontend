import {Component, OnDestroy, OnInit} from '@angular/core';
import {fromTopAnimation} from '../../../animations';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, map, shareReplay, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject, OperatorFunction} from 'rxjs';
import {CrudService} from '../../../services/crud.service';
import {NzContextMenuService, NzDropdownMenuComponent, NzMessageService} from 'ng-zorro-antd';
import {queryParamsPack, queryParamsUnpack} from 'src/utils/params'
import {ItemType, NoteModel, NoteWithTags} from '../../../models/note.model';
import {toArray, truncateForHtml} from '../../../../utils/utils1';
import {TagsService} from '../../../services/tags.service';
import {TagModel} from '../../../models/tag.model'

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

  public searchTags: string[] = [];
  public excludedTags: string[] = [];
  public notesSearchString: string;
  public items: NoteWithTags[];
  public listType: ItemType;
  public allTags: TagModel[] = [];


  private unsubscribe$ = new Subject<void>();
  private searchNoteDecouncer$: Subject<string> = new Subject();

  constructor(
    public store: StoreService,
    public actionService: ActionService,
    private router: Router,
    private route: ActivatedRoute,
    public crudService: CrudService,
    private messageService: NzMessageService,
    private tagsService: TagsService,
    private nzContextMenuService: NzContextMenuService
  ) {
  }

  public contextMenu($event, menu: NzDropdownMenuComponent): void {
    if ($event.target.tagName !== 'A') {
      this.nzContextMenuService.create($event, menu);
    }
  }

  public closeMenu(): void {
    this.nzContextMenuService.close();
  }

  public changeCheckbox(tag: string, push: boolean): void {

    const removeFromFilter = (array, removedTag) => {
      const index: number = array.indexOf(removedTag);
      if (index !== -1) {
        array.splice(index, 1);
      }
    };

    if (!this.searchTags.includes(tag) && push) {
      this.searchTags.push(tag);

      removeFromFilter(this.excludedTags, tag);
    } else {
      if (!push) {
        this.excludedTags.push(tag);
      }

      removeFromFilter(this.searchTags, tag);
    }

    this.refresh_url_search();

  }

  public copyURL(id: string, title: string): void {
    const inputValue: string = window.location.origin + '/note/' + id + `?titlev=${title}`;
    navigator.clipboard.writeText(inputValue);
  }

  public getMoreNotesData() {
    if (this.store.data.notes.downloadMore) {
      this.actionService.getNotes(this.searchTags, this.notesSearchString, {excludeTags: this.excludedTags}).pipe(
        this.mapTagsToNote(),
        takeUntil(this.unsubscribe$)
      ).subscribe((notes: NoteWithTags[]) => this.items = this.items.concat(notes));
    }
  }

  public ngOnInit(): void {
    const tags$ = this.tagsService.getTags().pipe(
      tap((tags: TagModel[]) => this.allTags = tags.map((tag: TagModel) => ({...tag, checked: this.searchTags.includes(tag.id)}))),
      switchMap(() => this.crudService.getItemType()),
      switchMap((itemType: ItemType) => {
        this.listType = itemType;
        return this.route.queryParams;
      }),
      switchMap((params: Params) => this.getItems(params)),
      this.mapTagsToNote(),
      shareReplay(1),
      takeUntil(this.unsubscribe$),
    );
    tags$.subscribe((notes: NoteWithTags[]) => this.items = notes);
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

  public addNote(): void {
    const queryParams = queryParamsPack({tags: this.searchTags, search: this.notesSearchString, exclude: this.excludedTags});
    this.router.navigate(['/note'], {queryParams});
  }

  public filterNotesTag(tags: string[], include: boolean): void {
    include ? this.searchTags = tags : this.excludedTags = tags;

    this.allTags = this.allTags.map((tag: TagModel) => ({...tag, checked: tags.includes(tag.id)}));

    this.refresh_url_search();
  }

  public noteSelect(id, event?): void {
    if (event === undefined || event.target.tagName !== 'A') {
      this.store.data.note.lastUpdatedId = '';
      this.router.navigate(['/note/' + id]);
    }
  }

  public deleteItem(id: string, event) {
    event.stopPropagation();
    const r = confirm('Данный элемент будет удален! Вы уверены?');
    if (r) {
      this.crudService.deleteItem(id).pipe(
        switchMap(() => this.route.queryParams),
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        const deletedItem = this.items.findIndex((note: NoteModel) => note.id === id);
        this.items.splice(deletedItem, 1);
        if (this.listType === ItemType.tag) {
          this.tagsService.deleteTag(id);
        }
      });
    }
  }

  // Обновить роут при фильтрации и запросах
  async refresh_url_search() {
    const queryParams = queryParamsPack({tags: this.searchTags, search: this.notesSearchString, exclude: this.excludedTags});
    return this.router.navigate(['/notes'], {queryParams});
  }

  private getItems(urlParams: Params): Observable<NoteModel[]> {
    const params = queryParamsUnpack(urlParams);
    this.notesSearchString = params.search || '';
    this.searchTags = params.tags || [];
    this.excludedTags = params.exclude || [];
    return this.actionService.getNotes(params.tags, params.search, {refresh: true, excludeTags: params.exclude}).pipe(
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

  private mapTagsToNote(): OperatorFunction<NoteModel[], NoteWithTags[]> {
    return source => source.pipe(
      map((items: NoteModel[]) => items.map((item: NoteModel) => item.tags ?
        {
          ...item,
          tags: item.tags.map((tagId: string) => {
            return this.allTags.find((tag: TagModel) => tag.id === tagId) || {title: 'ошибка системы! Тег был удалён! '} as TagModel;
          })
        } : {...item, tags: []}))
    );
  }
}
