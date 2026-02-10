import { useCallback, useState } from 'react';  // 只 import hook，不 import React 本身
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Edge,
  Connection,
  MiniMap,
  Node,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import { CustomNode } from './CustomNode';
import 'reactflow/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { label: '原油', type: 'item' },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 500, y: 100 },
    data: { label: '泵机', type: 'machine' },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 900, y: 100 },
    data: { label: '蒸馏塔', type: 'machine' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menu, setMenu] = useState<{ top: number; left: number; position?: { x: number; y: number } } | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setMenu({
        top: event.clientY,
        left: event.clientX,
        position: flowPos,
      });
    },
    [screenToFlowPosition]
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
    setSelectedNode(null);
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (label: string, type: 'item' | 'machine') => {
    if (!menu?.position) return;
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'custom',
      position: menu.position,
      data: { label, type },
    };
    setNodes((nds) => nds.concat(newNode));
    setMenu(null);
  };

  const getInputs = (nodeId: string) => {
    return edges
      .filter((e) => e.target === nodeId)
      .map((e) => nodes.find((n) => n.id === e.source)?.data.label || '未知输入');
  };

  const getOutputs = (nodeId: string) => {
    return edges
      .filter((e) => e.source === nodeId)
      .map((e) => nodes.find((n) => n.id === e.target)?.data.label || '未知用途');
  };

  const saveBlueprint = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-industrial-blueprint.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadBlueprint = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      } catch (err) {
        alert('加载失败：文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 顶部按钮 */}
      <div style={{ background: '#111', padding: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button onClick={saveBlueprint} style={{ padding: '12px 24px', fontSize: '16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          💾 保存整图
        </button>
        <label style={{ padding: '12px 24px', fontSize: '16px', background: '#2196f3', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
          📂 加载整图
          <input type="file" accept=".json" onChange={loadBlueprint} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            onPaneContextMenu={onPaneContextMenu}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            {menu && (
              <div style={{ position: 'absolute', top: menu.top, left: menu.left, background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <div style={{ cursor: 'pointer', padding: '8px' }} onClick={() => addNode('新物品', 'item')}>
                  ➕ 加物品（绿）
                </div>
                <div style={{ cursor: 'pointer', padding: '8px' }} onClick={() => addNode('新机器', 'machine')}>
                  ➕ 加机器（蓝）
                </div>
                <div style={{ cursor: 'pointer', padding: '8px' }} onClick={() => setMenu(null)}>
                  关闭
                </div>
              </div>
            )}
          </ReactFlow>
        </div>

        <div style={{ width: '400px', background: '#2d2d2d', color: '#fff', padding: '24px' }}>
          <h2>节点详情</h2>
          {selectedNode ? (
            <div>
              <h3>{selectedNode.data.label}</h3>
              <strong>输入：</strong>
              {getInputs(selectedNode.id).length > 0 ? (
                <ul>
                  {getInputs(selectedNode.id).map((input, i) => (
                    <li key={i}>{input}</li>
                  ))}
                </ul>
              ) : (
                <p>无输入</p>
              )}
              <strong>输出：</strong>
              {getOutputs(selectedNode.id).length > 0 ? (
                <ul>
                  {getOutputs(selectedNode.id).map((output, i) => (
                    <li key={i}>{output}</li>
                  ))}
                </ul>
              ) : (
                <p>无输出</p>
              )}
            </div>
          ) : (
            <p>点击节点查看</p>
          )}
        </div>
      </div>
    </div>
  );
}