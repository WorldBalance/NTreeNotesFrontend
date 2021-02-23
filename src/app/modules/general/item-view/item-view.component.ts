import {Component, OnInit} from '@angular/core';
import {Note} from '../../../services/Store/NotesData.service';
import {iif, Subject} from 'rxjs';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CrudService} from '../../../services/crud.service';
import {pluck, switchMap, takeUntil, tap} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {TagsService} from '../../../services/tags.service';
import {toArray, plainTextToHtmlWithBr} from '../../../../utils/utils1';
import {NoteModel} from '../../../models/note.model';
import {Autolinker} from 'autolinker';
declare const $: any;


@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.css']
})


export class ItemViewComponent implements OnInit {

  public noteId: string;
  public note: Note;
  public importUrls: Array<string> = ['https://ntree.online/s/libs/jquery/3.5.1/min.js',
    'https://ntree.online/s/libs/magnific-popup/1.1.0/jquery.magnific-popup.min.js'
  ];

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
    // external import
      this.importUrls.forEach(url => {
        const node = document.createElement('script');
        node.src = url;
        node.type = 'text/javascript';
        node.async = false;
        document.getElementsByTagName('head')[0].appendChild(node);
      });

      this.createGallery()
  }

  private createGallery(){
    // checking import JQuery and Magnific-Popup libs
    // if everything ok -> use Magnific for creating Gallery
    let countTrying = 0;

    const timer = setInterval(async () => {
      countTrying++;
      if(typeof $ === 'function') {
        if (typeof $.magnificPopup !== 'undefined') {
            await $('.popup-gallery').magnificPopup({
            delegate: 'a',
            type: 'image',
            tLoading: 'Loading image #%curr%...',
            mainClass: 'mfp-img-mobile',
            gallery: {
              enabled: true,
              navigateByImgClick: true,
              preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
            },
            image: {
              tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
            }
          });
          clearInterval(timer);
        }
      }
      if(countTrying > 20){
        clearInterval(timer);
        alert('You have trouble with Gallery or uploading data from server, restart page, please.')
      };
    }, 200);
  }

  public editNote(id: string): void{
    this.router.navigate(['/note/' + id]);
  }

  public displayText(text: string){
    return Autolinker.link(plainTextToHtmlWithBr(text));
  }
}
