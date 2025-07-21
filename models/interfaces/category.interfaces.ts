import { Document as MongoDocument, ObjectId } from "mongodb"
import { PublishStatus } from "./global.interfaces"

export interface Category extends MongoDocument {
  _id?: ObjectId
  name: string
  slug: string
  description: string
  level: number
  parentId: ObjectId
  ancestors: ObjectId[]
  path: string
  imageUrl: string
  publish: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  createdAt?: string
  updatedAt?: string
}

export type CategoryType = {
  name: string,
  parentId: string,
  description: string,
  imageUrl: string,
  publish: string,
  meta_title: string,
  meta_description: string
  meta_keywords: string
}

export const initCategory: CategoryType = {
    name: '',
    parentId: '',
    description: '',
    publish: PublishStatus.PUBLISHED,
    imageUrl: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
}

export interface SeoSuggestions {
    categoryName: string[]
    categoryDescription: string[]
    metaTitle: string[]
    metaDescription: string[]
    metaKeywords?: string[]
}
  
export interface SeoScores {
    metaTitleLengthStatus: 'short' | 'ideal' | 'long'
    metaTitleKeywordPresent: boolean
    metaDescriptionLengthStatus: 'short' | 'ideal' | 'long'
    metaDescriptionKeywordPresent: boolean
    descriptionWordCountStatus: 'short' | 'ideal' | 'long'
    descriptionKeywordDensity: number
    descriptionKeywordPresence: boolean
}
  

export const AggregateCond = (findIn: string[], collectionName: string) => {
  return [
    {
      $match: {
          _id: { $in: findIn}
      }
  },
  {
      $lookup: {
          from: collectionName,
          localField: "parentId",
          foreignField: "_id",
          as: "parentCategory"
      }
  },
  {
      $unwind: {
          path: "$parentCategory",
          preserveNullAndEmptyArrays: true,
      }
  },
  {
      $project: {
          _id: { $toString: "$_id" },
          name: 1,
          level: 1,
          ancestors: 1,
          path: 1,
          imageUrl: 1,
          publish: 1,
          meta_title: 1,
          meta_description: 1,
          slug: 1,
          parentId: {
              $cond: {
                  if: "$parentId",
                  then: { $toString: "$parentId" },
                  else: null
                }
          },
          description: 1,
          parentName: "$parentCategory.name",
          createdAt: 1,
          updatedAt: 1
      }
  }
  ]
}