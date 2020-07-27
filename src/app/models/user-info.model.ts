export interface UserInfoModel {
  ok: boolean;
  errorId?: string;
  errorMessage?: string;
  context?: {
    sourceId: string;
    dataIn: {
      ver: string;
      namespace: string;
      actionId: string;
      object: {
        photo_url: string;
      }
    }
  }
  object?: {
    id: string;
    name: string;
    photo_url: string
  }
}
