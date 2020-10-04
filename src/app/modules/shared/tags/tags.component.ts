import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  Input,
  EventEmitter,
  Output,
  ChangeDetectorRef
} from '@angular/core';
import {TagModel} from '../../../models/tag.model';
import {finalize, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {NzSelectComponent} from 'ng-zorro-antd';
import {CrudService} from '../../../services/crud.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsComponent implements OnDestroy, OnInit {

  public confirmPopupVisibility: boolean;
  public loading: boolean;
  public newTagName: string;
  public tags$: Observable<TagModel[]>;
  @Input() public noteTags: string[];

  @ViewChild('nzSelectComponent', {static: false}) private selectComponent: NzSelectComponent;
  @Output() private noteTagsChange = new EventEmitter<string[]>();
  private tags: TagModel[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(private crudService: CrudService, private cdr: ChangeDetectorRef) {
  }

  public ngOnInit() {
    this.tags$ = this.crudService.getTags().pipe(
      tap((tags: TagModel[]) => this.tags = tags)
    );
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public addTag(tags: string[]): void {
    const newTag = tags.find((tag: string) => !this.tags
      .map((existedTag: TagModel) => existedTag.id)
      .includes(tag));
    if (newTag) {
      const newTagIndex = tags.findIndex((tag: string) => tag === newTag);
      tags.splice(newTagIndex, 1);
      if (!!newTag.replace(/\s/g, '').length) {
        this.selectComponent.toggleDropDown();
        this.newTagName = newTag;
        setTimeout(() => {
          this.confirmPopupVisibility = true;
          this.cdr.markForCheck();
        }, 100);
      }
    } else {
      this.noteTagsChange.emit(tags);
    }
  }

  public createTag(): void {
    this.loading = true;
    this.crudService.AddTag(this.newTagName).pipe(
      finalize(() => this.confirmPopupVisibility = this.loading = false),
      takeUntil(this.unsubscribe$)
    ).subscribe((id: string) => {
      this.tags.push({id, title: this.newTagName, type: 'tag'});
      this.noteTags.push(id);
      this.noteTagsChange.emit(this.noteTags);
      this.newTagName = '';
      this.selectComponent.value.push(id);
    });
  }
}
