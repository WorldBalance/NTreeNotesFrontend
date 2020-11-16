import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {TagModel} from '../../../models/tag.model';
import {finalize, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {NzSelectComponent} from 'ng-zorro-antd';
import {CrudService} from '../../../services/crud.service';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {TagsService} from '../../../services/tags.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TagsComponent),
    multi: true
  }]
})
export class TagsComponent implements OnDestroy, OnInit, ControlValueAccessor {

  public confirmPopupVisibility: boolean;
  public loading: boolean;
  public newTagName: string;
  public tags$: Observable<TagModel[]>;
  @Input() value: string[] = [];
  @Input() placeholder: string;
  @Output() private valueChanged = new EventEmitter<string[]>();

  @ViewChild('nzSelectComponent', {static: false}) private selectComponent: NzSelectComponent;
  private tags: TagModel[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(private crudService: CrudService, private cdr: ChangeDetectorRef, private tagsService: TagsService) {
  }

  public ngOnInit() {
    this.tags$ = this.tagsService.getTags().pipe(
      tap((tags: TagModel[]) => this.tags = tags)
    );
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public addTag(tags: string[]): void {
    const tagsArray = this.tags.map((existedTag: TagModel) => existedTag.id);
    const newTag = tags.find((tag: string) => !tagsArray.includes(tag));
    if (newTag) {
      const newTagIndex = tags.findIndex((tag: string) => tag === newTag);
      tags.splice(newTagIndex, 1);
      if (!!newTag.replace(/\s/g, '').length) {
        this.selectComponent.closeDropDown();
        this.newTagName = newTag;
        setTimeout(() => {
          this.confirmPopupVisibility = true;
          this.cdr.markForCheck();
        }, 100);
      }
    } else {
      this.value = tags;
      this.onChange(tags);
    }
  }

  public createTag(): void {
    this.loading = true;
    this.tagsService.addTag(this.newTagName).pipe(
      finalize(() => this.confirmPopupVisibility = this.loading = false),
      takeUntil(this.unsubscribe$)
    ).subscribe((id: string) => {
      this.newTagName = '';
      this.selectComponent.value.push(id);
      this.selectComponent.toggleDropDown();
      this.value = this.selectComponent.value;
      this.onChange(this.selectComponent.value);
    });
  }

  private onChange: any = (tags: string[]) => {
    this.valueChanged.emit(tags);
  }

  private onTouched: any = () => {}

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  writeValue(value: string[]): void {
    this.value = value;
  }

  public onCancel() {
    this.confirmPopupVisibility = false;
    this.selectComponent.toggleDropDown();
  }
}
