const MOCK_WORKSPACES = [
  { key: 'repo', path: './repo' },
  { key: 'agent', path: './agent' }
];

export async function workspacesList() {
  return MOCK_WORKSPACES;
}

export async function getWorkspaceByKey(key) {
  const ws = MOCK_WORKSPACES.find((w) => w.key === key);
  if (!ws) throw new Error('workspace not found: ' + key);
  return ws;
}

