import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {Note} from '../../../services/Store/NotesData.service';
import {iif, Subject} from 'rxjs';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {CrudService} from '../../../services/crud.service';
import {pluck, switchMap, takeUntil, tap} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {TagsService} from '../../../services/tags.service';
import {toArray, plainTextToHtmlWithBr} from '../../../../utils/utils1';
import {NoteModel} from '../../../models/note.model';
import {Autolinker} from 'autolinker';


import * as $ from 'jquery';
import 'magnific-popup';


@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.css']
})


export class ItemViewComponent implements OnInit, AfterViewChecked {
  @ViewChild('img') imgElement: ElementRef;

  public noteId: string;
  public note: Note;

  private unsubscribe$ = new Subject<void>();

  constructor(
    public store: StoreService,
    public action: ActionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private crudService: CrudService,
    private tagsService: TagsService,
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
    ).subscribe((note: NoteModel) => {
      if(this.noteId){
        this.tagsService.mapTagsToNote(note).subscribe(
          (noteWithTags: NoteModel) => {
            const initialNote: Note = cloneDeep({...noteWithTags, tags: noteWithTags.tags || []});
            if(initialNote.url){
              initialNote.url = toArray(initialNote.url);
            }

            this.note = {
              title: initialNote.title,
              text: initialNote.text,
              tags: initialNote.tags,
              hasAvatar: initialNote.hasAvatar,
              url: initialNote.url,
              id: initialNote.id,
            };
          }
        );
      }
    });
  }

  ngAfterViewChecked(): void {
    setTimeout(()=>{
      // @ts-ignore
        $('.popup-gallery').magnificPopup({
          delegate: 'a',
          type: 'image',
          tLoading: 'Loading image #%curr%...',
          mainClass: 'mfp-img-mobile',
          gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0,1] // Will preload 0 - before current, and 1 after the current image
          },
          image: {
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
          }
        });
    }, 1000)
  }

  public editNote(id: string): void{
    this.router.navigate(['/note/' + id]);
  }

  public displayText(text: string){
    return Autolinker.link(plainTextToHtmlWithBr(text));
  }
}
