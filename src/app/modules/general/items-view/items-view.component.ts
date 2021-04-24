import {Component, Input, OnDestroy} from '@angular/core';
import {fromTopAnimation} from '../../../animations';
import {StoreService} from '../../../services/store.service';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {Subject} from 'rxjs';
import {ItemType, NoteWithTags} from '../../../models/note.model';
import {NotesWrapperComponent} from '../notes-wrapper/notes-wrapper.component';
import {Router} from "@angular/router";

@Component({
  selector: 'app-items-view',
  templateUrl: './items-view.component.html',
  styleUrls: ['./items-view.component.css'],
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
export class ItemsViewComponent implements OnDestroy {
  @Input() notesSearchString: string;
  @Input() items: NoteWithTags[];
  @Input() listType: ItemType;

  private unsubscribe$ = new Subject<void>();

  constructor(
    public store: StoreService,
    public parent: NotesWrapperComponent,
    public router: Router
  ) {}

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public open(id): void {
    this.router.navigate(['/view/' + id]);
  }
}
