export interface Breadcrumb {
  title: string,
  url: string
}

export default class BreadcrumbsService {
  private breadcrumbs: Breadcrumb[] = [];

  public work(title: string, url: string): Breadcrumb[]{
    this.breadcrumbs.push({title, url});
    if(this.breadcrumbs.length > 15) this.breadcrumbs.shift();
    return this.breadcrumbs;
  }
}
