import React, { useCallback, useState } from 'react';
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

  // 动态计算 R/U
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

  // 保存/加载函数
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
        alert('加载失败：文件格式错');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 顶部按钮栏 */}
      <div style={{ background: '#111', padding: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button onClick={saveBlueprint} style={{ padding: '12px 24px', fontSize: '16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          💾 保存整图为 JSON 文件
        </button>
        <label style={{ padding: '12px 24px', fontSize: '16px', background: '#2196f3', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
          📂 加载 JSON 文件
          <input type="file" accept=".json" onChange={loadBlueprint} style={{ display: 'none' }} />
        </label>
        <span style={{ color: '#aaa', marginLeft: 'auto' }}>右键空白加节点 | 双击节点编辑文字 | 点击节点查看动态 R/U</span>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* 主蓝图 */}
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

            {/* 右键菜单 */}
            {menu && (
              <div style={{ position: 'absolute', top: menu.top, left: menu.left, background: 'white', border: '1px solid #ccc', borderRadius: '8px', padding: '12px', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <div style={{ cursor: 'pointer', padding: '8px', fontWeight: 'bold' }} onClick={() => addNode('新物品', 'item')}>
                  ➕ 加物品节点（绿色）
                </div>
                <div style={{ cursor: 'pointer', padding: '8px', fontWeight: 'bold' }} onClick={() => addNode('新机器', 'machine')}>
                  ➕ 加机器节点（蓝色）
                </div>
                <div style={{ cursor: 'pointer', padding: '8px' }} onClick={() => setMenu(null)}>
                  关闭
                </div>
              </div>
            )}
          </ReactFlow>
        </div>

        {/* 右侧侧边栏：动态 R/U */}
        <div style={{ width: '400px', background: '#2d2d2d', color: '#fff', padding: '24px', overflowY: 'auto' }}>
          <h2 style={{ marginTop: 0 }}>节点详情（动态计算）</h2>
          {selectedNode ? (
            <div>
              <h3 style={{ color: '#ffdd00', marginBottom: '16px' }}>{selectedNode.data.label}</h3>

              <div style={{ marginBottom: '24px' }}>
                <strong style={{ color: '#88ff88' }}>Recipe（输入/产出配方）:</strong>
                {getInputs(selectedNode.id).length > 0 ? (
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {getInputs(selectedNode.id).map((input, i) => (
                      <li key={i}>输入来自：{input}</li>
                    ))}
                    <li>（这个节点产出供下游使用）</li>
                  </ul>
                ) : (
                  <p style={{ margin: '8px 0', color: '#aaa' }}>无输入（可能是资源起点）</p>
                )}
              </div>

              <div>
                <strong style={{ color: '#ff8888' }}>Usage（用途）:</strong>
                {getOutputs(selectedNode.id).length > 0 ? (
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {getOutputs(selectedNode.id).map((output, i) => (
                      <li key={i}>输出到：{output}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: '8px 0', color: '#aaa' }}>无输出（可能是终点）</p>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: '#aaa' }}>← 点击左侧节点查看动态 Recipe / Usage（根据连线自动计算）</p>
          )}
        </div>
      </div>
    </div>
  );
}