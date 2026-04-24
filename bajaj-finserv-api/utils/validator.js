const isValidEdge = (edge) => {
  if (!edge) return false;

  const trimmed = edge.trim();

  const regex = /^[A-Z]->[A-Z]$/;

  if (!regex.test(trimmed)) return false;

  const [parent, child] = trimmed.split("->");

  if (parent === child) return false;

  return true;
};

module.exports = { isValidEdge };