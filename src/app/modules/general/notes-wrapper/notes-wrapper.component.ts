import {Component, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
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
import {mapStaticTagReversed} from '../../../../../in/StaticTag';

@Component({
  selector: 'app-notes-wrapper',
  templateUrl: './notes-wrapper.component.html',
  styleUrls: ['./notes-wrapper.component.scss']
})

export class NotesWrapperComponent implements OnInit, OnDestroy {

  public searchTags: string[] = [];
  public excludedTags: string[] = [];
  public useTagsL = false;
  public notesSearchString: string;
  public items: NoteWithTags[];
  public listType: ItemType;
  public allTags: TagModel[] = [];
  public info = 'WORKING';

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
    private nzContextMenuService: NzContextMenuService,
    private location: Location,
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
    this.closeMenu();

  }

  public useTagsLCheckbox(): void {
    this.useTagsL = !this.useTagsL;
    this.refresh_url_search();
  }

  public getURL(item: NoteWithTags, opt?: { titlev?: boolean }): string {
    const prefix = this.location.prepareExternalUrl("");
    const res = [window.location.origin, prefix, 'note/', item.id];
    if (opt && opt.titlev && item.title) {
      res.push('?titlev="', item.title, '"');
    }
    return res.join('');
  }

  public copyURL(item: NoteWithTags): void {
    const res: string = this.getURL(item, {titlev: true});
    window.isSecureContext ? navigator.clipboard.writeText(res) : alert(res);
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
    // Decoding!
    // 1. Creating new Observable
    // 2. Using getTags from tagsService and return Observable with tags
    //  2.1. Mapping tags to local var with tags. Also adding field 'checked' (need for dropdown)
    //  2.2. Taking params from URL using this.route.queryParams Observable. If there is another listType,
    //       than we have in local var, set itemType, using crudService
    //  2.3. Return type of page using getItemType and switchMap;
    //  2.4. Set local var listType to pageType of our page and return new Observable with URL params
    //  2.5. Call this.getItems -> unpack params and return all Notes
    //  2.6. Map tags to notes

    const tags$ = this.tagsService.getTags().pipe(
      tap((tags: TagModel[]) => this.allTags = tags.map((tag: TagModel) => ({
          ...tag,
          checked: this.searchTags.includes(tag.id)
        }))),
      tap(() => this.route.queryParams.subscribe(params => {
        if (params.listType && params.listType !== this.listType) this.crudService.setItemType(params.listType)
      })),
      switchMap(() =>  this.crudService.getItemType()),
      switchMap((itemType: ItemType) => {
        this.listType = itemType;
        console.log(this.listType);
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

  public filterNotesTag(tags: string[], include: boolean): void {
    include ? this.searchTags = tags : this.excludedTags = tags;

    this.allTags = this.allTags.map((tag: TagModel) => ({...tag, checked: tags.includes(tag.id)}));

    this.refresh_url_search();
  }

  // Обновить роут при фильтрации и запросах
  async refresh_url_search() {
    const queryParams = queryParamsPack({
      tags: this.searchTags,
      search: this.notesSearchString,
      exclude: this.excludedTags,
      useTagsL: this.useTagsL,
      listType: this.listType
    });
    return this.router.navigate(['/notes'], {queryParams});
  }

  private getItems(urlParams: Params): Observable<NoteModel[]> {
    const params = queryParamsUnpack(urlParams);
    this.notesSearchString = params.search || '';
    this.searchTags = params.tags || [];
    this.excludedTags = params.exclude || [];
    this.useTagsL = params.useTagsL || false;
    const tags = this.useTagsL ? null : params.tags;
    const includeTagsL = this.useTagsL ? params.tags : null;
    const opt = {
      refresh: true,
      excludeTags: params.exclude,
      includeTagsL
    };
    return this.actionService.getNotes(
      tags,
      params.search,
      opt
    ).pipe(
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
            const staticName = mapStaticTagReversed[tagId];
            if (staticName) {
              return {title: staticName} as TagModel;
            }
            return this.allTags.find((tag: TagModel) => tag.id === tagId) || {title: '<неизвестный тег>'} as TagModel;
          })
        } : {...item, tags: []})),
      takeUntil(this.unsubscribe$)
    );
  }

  public async changeListType($event: ItemType): Promise<void> {
    await this.crudService.setItemType($event);
    this.refresh_url_search()
  }
}
