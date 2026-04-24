const { isValidEdge } = require("./validator");
const { parseEdge } = require("./parser");

/**
 * Main processing function
 */
const processData = (data) => {
  const invalid_entries = [];
  const duplicate_edges = [];

  const seenEdges = new Set();
  const validEdges = [];

  // STEP 1: Validate + remove duplicates
  data.forEach((edge) => {
    if (!isValidEdge(edge)) {
      invalid_entries.push(edge);
      return;
    }

    const trimmed = edge.trim();

    if (seenEdges.has(trimmed)) {
      if (!duplicate_edges.includes(trimmed)) {
        duplicate_edges.push(trimmed);
      }
      return;
    }

    seenEdges.add(trimmed);
    validEdges.push(parseEdge(trimmed));
  });

  // STEP 2: Build graph + handle multi-parent
  const adj = {};
  const childSet = new Set();
  const parentMap = {};

  validEdges.forEach(({ parent, child }) => {
    // Multi-parent handling → first wins
    if (parentMap[child]) return;

    parentMap[child] = parent;

    if (!adj[parent]) adj[parent] = [];
    if (!adj[child]) adj[child] = [];

    adj[parent].push(child);
    childSet.add(child);
  });

  // STEP 3: Find all nodes
  const allNodes = new Set(Object.keys(adj));

  // STEP 4: Find roots
  let roots = [];
  allNodes.forEach((node) => {
    if (!childSet.has(node)) {
      roots.push(node);
    }
  });

  // Special case: pure cycle (no roots)
  if (roots.length === 0 && allNodes.size > 0) {
    const smallest = [...allNodes].sort()[0];
    roots.push(smallest);
  }

  // STEP 5: DFS for tree + cycle detection
  const buildTree = (node, visited, stack) => {
    if (stack.has(node)) return "CYCLE";

    stack.add(node);

    const children = adj[node] || {};
    const subtree = {};

    for (let child of children) {
      const result = buildTree(child, visited, stack);

      if (result === "CYCLE") return "CYCLE";

      subtree[child] = result;
    }

    stack.delete(node);
    visited.add(node);

    return subtree;
  };

  // STEP 6: Depth calculation
  const calculateDepth = (node, tree) => {
    if (!tree[node] || Object.keys(tree[node]).length === 0) return 1;

    let max = 0;
    for (let child in tree[node]) {
      max = Math.max(max, calculateDepth(child, tree[node]));
    }

    return max + 1;
  };

  // STEP 7: Build hierarchies
  const hierarchies = [];
  let total_trees = 0;
  let total_cycles = 0;

  let maxDepth = 0;
  let largest_tree_root = "";

  roots.forEach((root) => {
    const visited = new Set();
    const stack = new Set();

    const result = buildTree(root, visited, stack);

    if (result === "CYCLE") {
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });
      total_cycles++;
    } else {
      const treeObj = { [root]: result };
      const depth = calculateDepth(root, treeObj);

      hierarchies.push({
        root,
        tree: treeObj,
        depth
      });

      total_trees++;

      if (
        depth > maxDepth ||
        (depth === maxDepth && root < largest_tree_root)
      ) {
        maxDepth = depth;
        largest_tree_root = root;
      }
    }
  });

  // STEP 8: Return final output
  return {
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root
    }
  };
};

module.exports = processData;