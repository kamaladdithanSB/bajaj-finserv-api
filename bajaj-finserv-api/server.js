const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// validate + clean input
function parseAndValidateEntries(rawData) {
  const invalidEntries = [];
  const duplicateEdges = [];
  const duplicateTracker = new Set();
  const seenEdges = new Set();
  const validEdges = [];

  if (!Array.isArray(rawData)) {
    return { validEdges, invalidEntries: [rawData], duplicateEdges };
  }

  for (const entry of rawData) {
    if (typeof entry !== "string") {
      invalidEntries.push(entry);
      continue;
    }

    const trimmed = entry.trim();
    const match = trimmed.match(/^([A-Z])->([A-Z])$/);

    if (!match) {
      invalidEntries.push(entry);
      continue;
    }

    const parent = match[1];
    const child = match[2];
    const edge = `${parent}->${child}`;

    if (parent === child) {
      invalidEntries.push(entry);
      continue;
    }

    if (seenEdges.has(edge)) {
      if (!duplicateTracker.has(edge)) {
        duplicateEdges.push(edge);
        duplicateTracker.add(edge);
      }
      continue;
    }

    seenEdges.add(edge);
    validEdges.push([parent, child]);
  }

  return { validEdges, invalidEntries, duplicateEdges };
}

// build directed graph
function buildGraph(validEdges) {
  const adj = new Map();
  const parentMap = new Map();
  const allNodes = new Set();

  for (const [p, c] of validEdges) {
    allNodes.add(p);
    allNodes.add(c);

    if (!adj.has(p)) adj.set(p, []);
    if (!adj.has(c)) adj.set(c, []);

    // multi-parent: first wins
    if (parentMap.has(c)) continue;

    parentMap.set(c, p);
    adj.get(p).push(c);
  }

  for (const [, children] of adj) {
    children.sort();
  }

  return { adj, allNodes };
}

// undirected graph for components
function buildUndirectedGraph(adj, allNodes) {
  const g = new Map();

  for (const node of allNodes) {
    g.set(node, new Set());
  }

  for (const [p, children] of adj) {
    for (const c of children) {
      g.get(p).add(c);
      g.get(c).add(p);
    }
  }

  return g;
}

// connected components
function getComponents(g) {
  const visited = new Set();
  const components = [];

  const nodes = Array.from(g.keys()).sort();

  for (const start of nodes) {
    if (visited.has(start)) continue;

    const stack = [start];
    const comp = [];
    visited.add(start);

    while (stack.length) {
      const cur = stack.pop();
      comp.push(cur);

      for (const nei of g.get(cur)) {
        if (!visited.has(nei)) {
          visited.add(nei);
          stack.push(nei);
        }
      }
    }

    comp.sort();
    components.push(comp);
  }

  return components;
}

// cycle detection
function hasCycle(component, adj) {
  const state = new Map(); // 0,1,2

  component.forEach(n => state.set(n, 0));

  function dfs(node) {
    state.set(node, 1);

    for (const child of adj.get(node) || []) {
      if (!state.has(child)) continue;

      if (state.get(child) === 1) return true;
      if (state.get(child) === 0 && dfs(child)) return true;
    }

    state.set(node, 2);
    return false;
  }

  for (const n of component) {
    if (state.get(n) === 0 && dfs(n)) return true;
  }

  return false;
}

// pick root
function getRoot(component, adj) {
  const set = new Set(component);
  const childSet = new Set();

  for (const node of component) {
    for (const c of adj.get(node) || []) {
      if (set.has(c)) childSet.add(c);
    }
  }

  const roots = component.filter(n => !childSet.has(n)).sort();

  return roots.length ? roots[0] : component.slice().sort()[0];
}

// build tree
function buildTree(root, adj, allowed) {
  const res = {};

  for (const c of adj.get(root) || []) {
    if (!allowed.has(c)) continue;
    res[c] = buildTree(c, adj, allowed);
  }

  return res;
}

// depth
function getDepth(root, adj, allowed) {
  function dfs(node) {
    const children = (adj.get(node) || []).filter(c => allowed.has(c));
    if (!children.length) return 1;

    return 1 + Math.max(...children.map(dfs));
  }

  return dfs(root);
}

// main processor
function process(data) {
  const { validEdges, invalidEntries, duplicateEdges } = parseAndValidateEntries(data);
  const { adj, allNodes } = buildGraph(validEdges);

  if (!allNodes.size) {
    return {
      hierarchies: [],
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary: { total_trees: 0, total_cycles: 0, largest_tree_root: null }
    };
  }

  const undirected = buildUndirectedGraph(adj, allNodes);
  const comps = getComponents(undirected);

  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;

  let maxDepth = -1;
  let largestRoot = "";

  for (const comp of comps) {
    const set = new Set(comp);
    const root = getRoot(comp, adj);
    const cycle = hasCycle(comp, adj);

    if (cycle) {
      totalCycles++;
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });
      continue;
    }

    totalTrees++;
    const tree = { [root]: buildTree(root, adj, set) };
    const depth = getDepth(root, adj, set);

    if (
      depth > maxDepth ||
      (depth === maxDepth && root < largestRoot)
    ) {
      maxDepth = depth;
      largestRoot = root;
    }

    hierarchies.push({
      root:root,
      tree:tree,
      depth
    });
  }

  return {
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestRoot
    }
  };
}

// API
app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;
    const result = process(data);

    res.json({
      user_id: "yourname_ddmmyyyy",
      email_id: "your@email.com",
      college_roll_number: "yourroll",
      ...result
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => console.log("Server running"));