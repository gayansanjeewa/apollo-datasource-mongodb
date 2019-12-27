import { Collection, Model } from 'mongoose'

const TYPEOF_COLLECTION = 'object'

export const isModel = (x: Collection | Model<any>) =>
  Boolean(x && x.name === 'model')

export const isCollectionOrModel = (x: any) =>
  Boolean(x && (typeof x === TYPEOF_COLLECTION || isModel(x)))

export const getCollection = (x: Collection | Model<any>): Collection =>
  isModel(x) ? (x as Model<any>).collection : (x as Collection)
