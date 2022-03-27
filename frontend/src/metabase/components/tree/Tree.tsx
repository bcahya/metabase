import React, { useState, useCallback } from "react";
import { TreeNodeList } from "./TreeNodeList";
import { TreeNode as DefaultTreeNode } from "./TreeNode";
import { getInitialExpandedIds } from "./utils";
import { ITreeNodeItem, TreeNodeComponent } from "./types";

interface TreeProps {
  data: ITreeNodeItem[];
  selectedId?: ITreeNodeItem["id"];
  emptyState?: React.ReactNode;
  TreeNode?: TreeNodeComponent;
}

export function Tree({
  data,
  selectedId,
  emptyState = null,
  TreeNode = DefaultTreeNode,
}: TreeProps) {
  const [expandedIds, setExpandedIds] = useState(
    new Set(selectedId != null ? getInitialExpandedIds(selectedId, data) : []),
  );

  const handleToggleExpand = useCallback(
    itemId => {
      if (expandedIds.has(itemId)) {
        setExpandedIds(prev => new Set([...prev].filter(id => id !== itemId)));
      } else {
        setExpandedIds(prev => new Set([...prev, itemId]));
      }
    },
    [expandedIds],
  );

  if (data.length === 0) {
    return <React.Fragment>{emptyState}</React.Fragment>;
  }

  return (
    <TreeNodeList
      items={data}
      TreeNode={TreeNode}
      onToggleExpand={handleToggleExpand}
      expandedIds={expandedIds}
      selectedId={selectedId}
      depth={0}
    />
  );
}
