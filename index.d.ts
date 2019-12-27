declare module 'apollo-datasource-mongodb' {
  import { DataSource, DataSourceConfig } from 'apollo-datasource'
  import { Document, Collection, Model } from 'mongoose'

  export { DataSourceConfig }

  interface Options {
    ttl: number
  }

  export abstract class MongoDataSource<
    T extends Document,
    TContext = any
  > extends DataSource {
    collection: Collection
    model?: Model<T>
    constructor(collection: Collection | Model<T>)
    public initialize(config: DataSourceConfig<TContext>): void
    protected findOneById(id: string, { ttl }?: Options): T | null
    protected findManyByIds(ids: string[], { ttl }?: Options): (T | null)[]
    protected deleteFromCacheById(id: string): void
  }
}
