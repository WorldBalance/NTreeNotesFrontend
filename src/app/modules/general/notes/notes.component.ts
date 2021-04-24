import {Component, Input, OnDestroy, OnInit} from '@angular/core';
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
import {mapStaticTagReversed} from '../../shared/staticTags.module';
import {NotesWrapperComponent} from "../notes-wrapper/notes-wrapper.component";

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
  @Input() searchTags: string[];
  @Input() excludedTags: string[];
  @Input() useTagsL = false;
  @Input() notesSearchString: string;
  @Input() items: NoteWithTags[];
  @Input() listType: ItemType;
  @Input() allTags: TagModel[];


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
    public parent: NotesWrapperComponent
  ) {
  }

  public ngOnInit(): void {
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
      await this.parent.refresh_url_search();
    });
  }

  public addNote(): void {
    const queryParams = queryParamsPack({
        tags: this.searchTags,
        search: this.notesSearchString,
        exclude: this.excludedTags,
        useTagsL: this.useTagsL,
        listType: this.listType
      }
    );
    this.router.navigate(['/note'], {queryParams});
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
        const deletedItem = this.items.findIndex((note: NoteWithTags) => note.id === id);
        this.items.splice(deletedItem, 1);
        if (this.listType === ItemType.tag) {
          this.tagsService.deleteTag(id);
        }
      });
    }
  }
}
