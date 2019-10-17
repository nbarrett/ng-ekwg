export interface ContentText {
  name: string;
  category?: string;
  text: string;

  $id?(): any;

  $saveOrUpdate?(saveCallback?, updateCallback?, errorSaveCallback?, errorUpdateCallback?): Promise<ContentText>;

  $remove?(): Promise<ContentText>;
}

