import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  label: string;
  style?: React.CSSProperties;
}

interface HandleStyle {
  background: string;
  width: string;
  height: string;
}

const SpecialNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable }) => {
  const handleStyle: HandleStyle = {
    background: '#555',
    width: '8px',
    height: '8px'
  };

  return (
    <div className="special-node">
      {/* Handle سمت چپ */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      
      {/* محتوای نود */}
      <div style={data.style}>{data.label}</div>
      
      {/* Handle سمت راست */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={handleStyle}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default SpecialNode; 