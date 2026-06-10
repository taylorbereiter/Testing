// ─────────────────────────────────────────────────────────────────────────────
// nav.js — waypoint graph + A* pathfinding for NPC movement
// Coordinates in metres: x → east, z → south, y → up. Courtyard centre ≈ origin.
// ─────────────────────────────────────────────────────────────────────────────
window.EC = window.EC || {};

(function () {
  const NODES = {
    // approach & bridge
    bridgeW:   [-112, 0, 0],
    bridgeE:   [-84, 0, 0],
    rampGapW:  [-72, 0, 0],
    apronW:    [-55, 0, 0],
    gateOut:   [-44, 0, 0],
    gateMid:   [-32, 0, 0],
    courtW:    [-20, 0, 0],
    // courtyard (fountain stands at (0, 4) — no node path crosses it)
    cyC:  [0, -6, 0],
    cyN:  [0, -14, 0],
    cyS:  [0, 14, 0],
    cyE:  [15, 0, 0],
    cyW:  [-14, 6, 0],
    // great hall (north wing interior)
    hallDoor: [0, -19, 0],
    hallC:    [0, -27, 0],
    hallW:    [-21, -27, 0],
    hallE:    [22, -27, 0],
    // chapel (south wing, east half)
    chapelDoorOut: [8, 16, 0],
    chapelIn:      [8, 27, 0],
    altar:         [29, 27, 0],
    // casemates
    caseTop:    [14, 8, 0],
    caseBottom: [29, 8, -4.2],
    holger:     [32, -2, -4.2],
    // apron ring (ground between castle and ramparts)
    apN:  [0, -52, 0],
    apS:  [0, 52, 0],
    apE:  [52, 0, 0],
    apNE: [52, -52, 0],
    apSE: [52, 52, 0],
    apSW: [-52, 52, 0],
    apNW: [-52, -52, 0],
    // garden (south apron)
    gardenA: [6, 48, 0],
    gardenB: [17, 51, 0],
    // rampart ramps + rampart walk (top = 6 m)
    rampNbase: [20, -48, 0],
    rampNtop:  [20, -77, 6],
    rampSbase: [-20, 48, 0],
    rampStop:  [-20, 77, 6],
    rampN:  [0, -77, 6],
    rampNE: [77, -77, 6],
    rampE:  [77, 0, 6],
    battery2: [77, 30, 6],
    rampSE: [77, 77, 6],
    rampS:  [0, 77, 6],
    rampSW: [-77, 77, 6],
    rampNW: [-77, -77, 6],
    rampWn: [-77, -30, 6],
    rampWs: [-77, 30, 6],
    // outside the moat
    outSW:     [-104, 55, 0],
    graveyard: [-62, 110, 0],
    gyB:       [-72, 116, 0],
    willow:    [-48, 100, 0],
  };

  const EDGES = [
    ['bridgeW', 'bridgeE'], ['bridgeE', 'rampGapW'], ['rampGapW', 'apronW'],
    ['apronW', 'gateOut'], ['gateOut', 'gateMid'], ['gateMid', 'courtW'],
    ['courtW', 'cyC'], ['courtW', 'cyW'], ['cyC', 'cyN'], ['cyC', 'cyE'], ['cyW', 'cyN'], ['cyW', 'cyS'],
    ['cyN', 'cyE'], ['cyS', 'cyE'], ['cyS', 'chapelDoorOut'],
    ['cyN', 'hallDoor'], ['hallDoor', 'hallC'], ['hallC', 'hallW'], ['hallC', 'hallE'],
    ['chapelDoorOut', 'chapelIn'], ['chapelIn', 'altar'], ['chapelDoorOut', 'cyE'],
    ['cyE', 'caseTop'], ['caseTop', 'caseBottom'], ['caseBottom', 'holger'],
    // courtyard ↔ apron only through the west gate
    ['apronW', 'apNW'], ['apronW', 'apSW'],
    ['apNW', 'apN'], ['apN', 'apNE'], ['apNE', 'apE'], ['apE', 'apSE'], ['apSE', 'apS'], ['apS', 'apSW'],
    ['apS', 'gardenA'], ['gardenA', 'gardenB'], ['gardenB', 'apSE'],
    ['apN', 'rampNbase'], ['rampNbase', 'rampNtop'], ['rampNtop', 'rampN'], ['rampNtop', 'rampNE'],
    ['apS', 'rampSbase'], ['rampSbase', 'rampStop'], ['rampStop', 'rampS'], ['rampStop', 'rampSW'],
    ['rampN', 'rampNE'], ['rampN', 'rampNW'], ['rampNE', 'rampE'], ['rampE', 'battery2'], ['battery2', 'rampSE'],
    ['rampSE', 'rampS'], ['rampS', 'rampSW'], ['rampSW', 'rampWs'], ['rampNW', 'rampWn'],
    ['bridgeW', 'outSW'], ['outSW', 'graveyard'], ['graveyard', 'gyB'], ['graveyard', 'willow'],
  ];

  const adj = {};
  for (const id of Object.keys(NODES)) adj[id] = [];
  for (const [a, b] of EDGES) {
    const [ax, az] = NODES[a], [bx, bz] = NODES[b];
    const d = Math.hypot(ax - bx, az - bz);
    adj[a].push([b, d]);
    adj[b].push([a, d]);
  }

  function h(a, b) {
    const [ax, az] = NODES[a], [bx, bz] = NODES[b];
    return Math.hypot(ax - bx, az - bz);
  }

  function nearestNode(x, z, y = 0) {
    let best = null, bd = Infinity;
    for (const id of Object.keys(NODES)) {
      const n = NODES[id];
      // strongly prefer nodes on the same level so NPCs route via ramps/stairs
      const d = Math.hypot(n[0] - x, n[1] - z) + Math.abs((n[2] || 0) - y) * 30;
      if (d < bd) { bd = d; best = id; }
    }
    return best;
  }

  // A* over node ids; returns array of node ids (start..goal) or null.
  function findPath(startId, goalId) {
    if (startId === goalId) return [startId];
    const open = new Map([[startId, 0]]);
    const g = { [startId]: 0 };
    const came = {};
    const f = { [startId]: h(startId, goalId) };
    while (open.size) {
      let cur = null, bf = Infinity;
      for (const id of open.keys()) if (f[id] < bf) { bf = f[id]; cur = id; }
      if (cur === goalId) {
        const path = [cur];
        while (came[cur]) { cur = came[cur]; path.unshift(cur); }
        return path;
      }
      open.delete(cur);
      for (const [nb, d] of adj[cur]) {
        const ng = g[cur] + d;
        if (ng < (g[nb] !== undefined ? g[nb] : Infinity)) {
          came[nb] = cur;
          g[nb] = ng;
          f[nb] = ng + h(nb, goalId);
          open.set(nb, ng);
        }
      }
    }
    return null;
  }

  function nodePos(id) {
    const n = NODES[id];
    return n ? { x: n[0], z: n[1], y: n[2] || 0 } : null;
  }

  EC.NAV = { NODES, nearestNode, findPath, nodePos };
})();
