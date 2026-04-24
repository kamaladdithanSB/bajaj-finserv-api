const parseEdge = (edge) => {
  const [parent, child] = edge.trim().split("->");
  return { parent, child };
};

module.exports = { parseEdge };