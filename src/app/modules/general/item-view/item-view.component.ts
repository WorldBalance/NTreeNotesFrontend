import { Component, OnInit } from '@angular/core';
import {Note} from '../../../services/Store/NotesData.service';
import {iif, Observable, Subject} from 'rxjs';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {CrudService} from '../../../services/crud.service';
import {map, pluck, shareReplay, switchMap, takeUntil, tap} from 'rxjs/operators';
import {QueryParamsPacked} from '../../../../utils/params';
import {cloneDeep} from 'lodash';
import {TagsService} from '../../../services/tags.service';


@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.css']
})


export class ItemViewComponent implements OnInit {
  public initialNote: Note;
  public noteId: string;
  public title: string;
  public note: any;
  public allTags: any;

  private unsubscribe$ = new Subject<void>();

  constructor(
    public store: StoreService,
    public action: ActionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private crudService: CrudService,
    private tagsService: TagsService
  ) {
  }

  ngOnInit(): void {
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
      if(this.noteId){
        this.initialNote = cloneDeep({...note as Note, tags: note.tags || []});
        this.note = {
          title: this.initialNote.title,
          text: this.initialNote.text,
          tags: this.initialNote.tags,
          hasAvatar: this.initialNote.hasAvatar,
          urls: this.initialNote.url,
        }

        this.note = this.tagsService.mapTagsToNote(this.note);
        console.log(this.note);
      }
    });
  }


}
