import { Task } from '../../data/types';

export type TreeNode = { id: string; name: string; children: TreeNode[] };

export function buildTree(tasks: Array<any>): TreeNode[] {
  if (!tasks?.length) return [];
  
  // Prefer explicit parent_id
  const byId = new Map<string, TreeNode>();
  tasks.forEach(t => byId.set(String(t.id), { id: String(t.id), name: t.name || 'Untitled', children: [] }));

  let usedParent = false;
  tasks.forEach(t => {
    const pid = t.parent_id ? String(t.parent_id) : null;
    if (pid && byId.has(pid)) {
      byId.get(pid)!.children.push(byId.get(String(t.id))!);
      usedParent = true;
    }
  });
  
  if (usedParent) {
    // roots are those never attached as children
    const childIds = new Set<string>();
    tasks.forEach(t => { if (t.parent_id) childIds.add(String(t.id)); });
    return tasks.filter(t => !t.parent_id).map(t => byId.get(String(t.id))!);
  }

  // Fallback: infer from WBS like "1.2.3"
  const root: Record<string, TreeNode> = {};
  tasks
    .sort((a,b)=>String(a.wbs||'').localeCompare(String(b.wbs||''), undefined, { numeric:true }))
    .forEach(t => {
      const w = String(t.wbs || t.id);
      const parts = w.split('.');
      let cursor: TreeNode | undefined;
      let keyPath = '';
      parts.forEach((p, idx) => {
        keyPath = idx ? `${keyPath}.${p}` : p;
        const existing =
          idx === 0 ? root[keyPath] :
          cursor!.children.find(c => c.name === keyPath);
        if (!existing) {
          const node: TreeNode = { 
            id: idx === parts.length-1 ? String(t.id) : `${keyPath}__grp`, 
            name: idx===parts.length-1 ? (t.name||w) : keyPath, 
            children: [] 
          };
          if (idx === 0) root[keyPath] = node;
          else cursor!.children.push(node);
          cursor = node;
        } else {
          cursor = existing;
        }
      });
    });
  return Object.values(root);
}

/**
 * Flattens a tree structure for virtualization
 */
export const flattenTree = (nodes: TreeNode[], expandedNodes: Set<string> = new Set()): TreeNode[] => {
  const result: TreeNode[] = [];
  
  const traverse = (nodeList: TreeNode[], level: number = 0) => {
    nodeList.forEach(node => {
      result.push({ ...node, level });
      
      if (node.children.length > 0 && expandedNodes.has(node.id)) {
        traverse(node.children, level + 1);
      }
    });
  };
  
  traverse(nodes);
  return result;
};

/**
 * Gets all descendant IDs of a node (including the node itself)
 */
export const getDescendantIds = (node: TreeNode): string[] => {
  const result: string[] = [node.id];
  
  const traverse = (children: TreeNode[]) => {
    children.forEach(child => {
      result.push(child.id);
      traverse(child.children);
    });
  };
  
  traverse(node.children);
  return result;
};

/**
 * Finds a node by ID in the tree
 */
export const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    
    const found = findNodeById(node.children, id);
    if (found) {
      return found;
    }
  }
  
  return null;
};

/**
 * Gets the path to a node (array of node IDs from root to target)
 */
export const getNodePath = (nodes: TreeNode[], targetId: string): string[] => {
  const path: string[] = [];
  
  const traverse = (nodeList: TreeNode[]): boolean => {
    for (const node of nodeList) {
      path.push(node.id);
      
      if (node.id === targetId) {
        return true;
      }
      
      if (traverse(node.children)) {
        return true;
      }
      
      path.pop();
    }
    
    return false;
  };
  
  traverse(nodes);
  return path;
};
