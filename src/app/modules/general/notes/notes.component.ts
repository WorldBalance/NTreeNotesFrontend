import {Component, Input, OnDestroy} from '@angular/core';
import {fromTopAnimation} from '../../../animations';
import {StoreService} from '../../../services/store.service';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import { switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CrudService} from '../../../services/crud.service';
import {NzMessageService} from 'ng-zorro-antd';
import {queryParamsPack} from 'src/utils/params'
import {ItemType, NoteWithTags} from '../../../models/note.model';
import {TagsService} from '../../../services/tags.service';
import {TagModel} from '../../../models/tag.model'
import {NotesWrapperComponent} from '../notes-wrapper/notes-wrapper.component';

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
export class NotesComponent implements OnDestroy {
  @Input() searchTags: string[] = [];
  @Input() excludedTags: string[] = [];
  @Input() useTagsL = false;
  @Input() notesSearchString: string;
  @Input() items: NoteWithTags[];
  @Input() listType: ItemType;
  @Input() allTags: TagModel[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(
    public store: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    public crudService: CrudService,
    private messageService: NzMessageService,
    private tagsService: TagsService,
    public parent: NotesWrapperComponent
  ) {
  }

  public ngOnDestroy(): void {
    // Do unsubscribe (need for all subscription)
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public addNote(): void {
    // Pack params from URL
    const queryParams = queryParamsPack({
        tags: this.searchTags,
        search: this.notesSearchString,
        exclude: this.excludedTags,
        useTagsL: this.useTagsL,
        listType: this.listType
      }
    );

    // Go to Note-Form using recently packed parameters
    this.router.navigate(['/note'], {queryParams});
  }

  public noteSelect(id, event?): void {
    // Open Note-From with id, if didn't click link in note
    if (event === undefined || event.target.tagName !== 'A') {
      this.store.data.note.lastUpdatedId = '';
      this.router.navigate(['/note/' + id]);
    }
  }

  public deleteItem(id: string, event) {
    event.stopPropagation();

    if (confirm('Данный элемент будет удален! Вы уверены?')) {
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
