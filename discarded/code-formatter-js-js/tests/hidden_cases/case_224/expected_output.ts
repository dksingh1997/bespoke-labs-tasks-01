export interface Store {
  getRecord(
    collectionName: string,
    documentPath: string,
  ): TaskEither<Error, Option<GenericRecord>>;
}

export default class StoreImpl extends Service implements Store {
  getRecord(
    collectionName: string,
    documentPath: string,
  ): TaskEither<Error, Option<GenericRecord>> {
    // Du sumi staff.
  }
}

export function loadPlugin(
  name: string,
  dirname: string,
): { filepath: string; value: mixed } {
  // ...
}
