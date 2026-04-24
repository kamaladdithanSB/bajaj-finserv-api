const buildGraph = (edges) => {
  const adj = {};
  const childSet = new Set();
  const parentMap = {};

  edges.forEach(({ parent, child }) => {
    // multi-parent handling
    if (parentMap[child]) return;

    parentMap[child] = parent;

    if (!adj[parent]) adj[parent] = [];
    if (!adj[child]) adj[child] = [];

    adj[parent].push(child);
    childSet.add(child);
  });

  return { adj, childSet };
};

module.exports = { buildGraph };