import { Task } from '../../data/types';

export interface TreeNode {
  id: string;
  name: string;
  task: Task;
  children: TreeNode[];
  level: number;
  isExpanded?: boolean;
}

/**
 * Builds a hierarchical tree structure from tasks
 * Uses WBS (Work Breakdown Structure) codes or parent_id relationships
 */
export const buildTree = (tasks: Task[]): TreeNode[] => {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  // Create a map of all tasks by ID for quick lookup
  const taskMap = new Map<string, Task>();
  tasks.forEach(task => {
    taskMap.set(task.id, task);
  });

  // First, try to build tree using WBS codes
  const wbsTree = buildTreeFromWBS(tasks);
  if (wbsTree.length > 0) {
    return wbsTree;
  }

  // Fallback to parent_id relationships
  return buildTreeFromParentId(tasks, taskMap);
};

/**
 * Builds tree structure using WBS (Work Breakdown Structure) codes
 * WBS codes like "1", "1.1", "1.1.1" indicate hierarchy
 */
const buildTreeFromWBS = (tasks: Task[]): TreeNode[] => {
  const wbsTasks = tasks.filter(task => task.wbs && task.wbs.trim() !== '');
  
  if (wbsTasks.length === 0) {
    return [];
  }

  // Sort tasks by WBS code for proper hierarchy
  wbsTasks.sort((a, b) => {
    const wbsA = a.wbs || '';
    const wbsB = b.wbs || '';
    return wbsA.localeCompare(wbsB, undefined, { numeric: true });
  });

  const rootNodes: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  wbsTasks.forEach(task => {
    const wbs = task.wbs || '';
    const wbsParts = wbs.split('.');
    
    const node: TreeNode = {
      id: task.id,
      name: task.name || `Task ${task.id}`,
      task,
      children: [],
      level: wbsParts.length - 1,
      isExpanded: true
    };

    nodeMap.set(task.id, node);

    if (wbsParts.length === 1) {
      // Root level task
      rootNodes.push(node);
    } else {
      // Find parent by WBS prefix
      const parentWbs = wbsParts.slice(0, -1).join('.');
      const parentTask = wbsTasks.find(t => t.wbs === parentWbs);
      
      if (parentTask && nodeMap.has(parentTask.id)) {
        const parentNode = nodeMap.get(parentTask.id)!;
        parentNode.children.push(node);
      } else {
        // If parent not found, treat as root
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
};

/**
 * Builds tree structure using parent_id relationships
 */
const buildTreeFromParentId = (tasks: Task[], taskMap: Map<string, Task>): TreeNode[] => {
  const rootNodes: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  // First pass: create all nodes
  tasks.forEach(task => {
    const node: TreeNode = {
      id: task.id,
      name: task.name || `Task ${task.id}`,
      task,
      children: [],
      level: 0,
      isExpanded: true
    };
    nodeMap.set(task.id, node);
  });

  // Second pass: establish parent-child relationships
  tasks.forEach(task => {
    const node = nodeMap.get(task.id)!;
    
    if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
      const parentNode = nodeMap.get(task.parent_task_id)!;
      parentNode.children.push(node);
      
      // Update level based on parent
      node.level = parentNode.level + 1;
    } else {
      // No parent or parent not found, treat as root
      rootNodes.push(node);
    }
  });

  return rootNodes;
};

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
