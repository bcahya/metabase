import { t } from "ttag";
import _ from "underscore";

import {
  Collection,
  CollectionId,
  CollectionContentModel,
} from "metabase-types/api";

import { IconProps } from "metabase/components/Icon";

import { getCollectionIcon } from "metabase/entities/collections";

export type Item = {
  name: string;
  description: string | null;
  collection_position?: number | null;
  id: number;
  getIcon: () => { name: string };
  getUrl: () => string;
  setArchived: (isArchived: boolean) => void;
  setPinned: (isPinned: boolean) => void;
  copy?: boolean;
  setCollection?: boolean;
  model: string;
};

export function nonPersonalOrArchivedCollection(
  collection: Collection,
): boolean {
  // @TODO - should this be an API thing?
  return !isPersonalCollection(collection) && !collection.archived;
}

export function isPersonalCollection(collection: Collection): boolean {
  return typeof collection.personal_owner_id === "number";
}

// Replace the name for the current user's collection
// @Question - should we just update the API to do this?
function preparePersonalCollection(c: Collection): Collection {
  return {
    ...c,
    name: t`Your personal collection`,
    originalName: c.name,
  };
}

// get the top level collection that matches the current user ID
export function currentUserPersonalCollections(
  collectionList: Collection[],
  userID: number,
): Collection[] {
  return collectionList
    .filter(l => l.personal_owner_id === userID)
    .map(preparePersonalCollection);
}

export function getParentPath(
  collections: Collection[],
  targetId: CollectionId,
): CollectionId[] | null {
  if (collections.length === 0) {
    return null; // not found!
  }

  for (const collection of collections) {
    if (collection.id === targetId) {
      return [collection.id]; // we found it!
    }
    if (collection.children) {
      const path = getParentPath(collection.children, targetId);
      if (path !== null) {
        // we found it under this collection
        return [collection.id, ...path];
      }
    }
  }
  return null; // didn't find it under any collection
}

function getNonRootParentId(collection: Collection) {
  if (Array.isArray(collection.effective_ancestors)) {
    // eslint-disable-next-line no-unused-vars
    const [root, nonRootParent] = collection.effective_ancestors;
    return nonRootParent ? nonRootParent.id : undefined;
  }
  // location is a string like "/1/4" where numbers are parent collection IDs
  const nonRootParentId = collection.location?.split("/")?.[0];
  return canonicalCollectionId(nonRootParentId);
}

export function isPersonalCollectionChild(
  collection: Collection,
  collectionList: Collection[],
): boolean {
  const nonRootParentId = getNonRootParentId(collection);
  if (!nonRootParentId) {
    return false;
  }
  const parentCollection = collectionList.find(c => c.id === nonRootParentId);
  return Boolean(parentCollection && !!parentCollection.personal_owner_id);
}

export function isRootCollection(collection: Collection): boolean {
  return collection.id === "root";
}

export function isItemPinned(item: Item) {
  return item.collection_position != null;
}

// API requires items in "root" collection be persisted with a "null" collection ID
// Also ensure it's parsed as a number
export function canonicalCollectionId(
  collectionId: string | number | null | undefined,
): number | null {
  if (collectionId === "root" || collectionId == null) {
    return null;
  } else if (typeof collectionId === "number") {
    return collectionId;
  } else {
    return parseInt(collectionId, 10);
  }
}

function hasIntersection(list1: unknown[], list2?: unknown[]) {
  if (!list2) {
    return false;
  }
  return _.intersection(list1, list2).length > 0;
}

type CollectionTreeBuilderOpts = {
  targetModels?: CollectionContentModel[];
};

export interface CollectionTreeItem extends Omit<Collection, "children"> {
  icon: string | IconProps;
  children?: CollectionTreeItem[];
}

export function buildCollectionTree(
  collections: Collection[],
  { targetModels }: CollectionTreeBuilderOpts = {},
): CollectionTreeItem[] {
  if (collections == null) {
    return [];
  }

  const shouldFilterCollections = Array.isArray(targetModels);

  return collections.flatMap(collection => {
    const hasTargetModels =
      !shouldFilterCollections ||
      hasIntersection(targetModels, collection.below) ||
      hasIntersection(targetModels, collection.here);

    return hasTargetModels
      ? {
          ...collection,
          schemaName: collection.originalName || collection.name,
          icon: getCollectionIcon(collection),
          children: buildCollectionTree(
            collection.children?.filter(child => !child.archived) || [],
            {
              targetModels,
            },
          ),
        }
      : [];
  });
}
