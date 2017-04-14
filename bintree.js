// vim: set ts=2 sts=2 sw=2:

window.addEventListener('DOMContentLoaded', init);

let nodeId = 0;

function tree2NodesAndEdges(tree, nodes, edges) {
  nodes.push({ id: tree.id, label: tree.value });
  if (tree.left) {
    edges.push({ from: tree.id, to: tree.left.id });
    tree2NodesAndEdges(tree.left, nodes, edges);
  }
  if (tree.right) {
    edges.push({ from: tree.id, to: tree.right.id });
    tree2NodesAndEdges(tree.right, nodes, edges);
  }
}

function addImpl(tree, val) {
  // 同値なら追加しない
  if (tree.value === val) {
    return;
  }

  // 辞書順昇順判定
  if (tree.value > val) {
    if (tree.left) {
      addImpl(tree.left, val);
    } else {
      tree.left = {
        id: nodeId++,
        value: val,
        parent: tree,
        left: null, right: null
      };
    }
  } else {
    if (tree.right) {
      addImpl(tree.right, val);
    } else {
      tree.right = {
        id: nodeId++,
        value: val,
        parent: tree,
        left: null, right: null
      };
    }
  }
}

function add(ctx, val) {
  addImpl(ctx.tree, val);
  let nodes = [], edges = [];
  tree2NodesAndEdges(ctx.tree, nodes, edges);
  ctx.network.setData({nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges)});
  console.log(JSON.stringify(ctx.tree, null, '  '));
}

function init() {
  const container = document.getElementById('tree');
  const input = document.getElementById('input');

  let nodes = new vis.DataSet([]);
  let edges = new vis.DataSet([]);
  let options = {
    layout: {
      hierarchical: {
        direction: "UD",
        sortMethod: "directed"
      }
    }
  };
  const network = new vis.Network(container, {nodes: nodes, edges: edges}, options);
  const tree = { };

  let ctx = {
    network: network,
    tree: tree
  };

  const btn = document.getElementById('btn');
  let first = (evt) => {
    ctx.tree = {
      id: nodeId++,
      value: parseFloat(input.value),
      parent: tree,
      left: null, right: null
    };
    let nodes = [], edges = [];
    tree2NodesAndEdges(ctx.tree, nodes, edges);
    ctx.network.setData({nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges)});

    btn.removeEventListener('click', first);
    btn.addEventListener('click', (evt) => {
      add(ctx, parseFloat(input.value));
    });
  };
  btn.addEventListener('click', first);
}

