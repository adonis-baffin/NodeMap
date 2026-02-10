import { useState } from 'react';  // 只 import useState
import { Handle, Position, NodeProps } from 'reactflow';

export const CustomNode: React.FC<NodeProps> = ({ data }) => {
  const [label, setLabel] = useState(data.label as string);
  const [editing, setEditing] = useState(false);

  return (
    <div
      style={{
        background: data.type === 'machine' ? '#3366cc' : '#66cc66',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        minWidth: '140px',
        textAlign: 'center',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        border: '2px solid #fff',
      }}
      onDoubleClick={() => setEditing(true)}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#fff' }} />
      {editing ? (
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => {
            setEditing(false);
            data.label = label;
          }}
          autoFocus
          style={{ width: '100%', textAlign: 'center', background: 'transparent', color: 'white', border: 'none' }}
        />
      ) : (
        <div>{label}</div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: '#fff' }} />
    </div>
  );
};