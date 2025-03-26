import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  Node,
  Edge,
  NodeTypes,
  ReactFlowInstance,
  FitViewOptions,
  DefaultEdgeOptions,
  NodeOrigin,
  Viewport,
  BackgroundVariant
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import SpecialNode from './SpecialNode';

interface NodeStyle {
  padding: string;
  borderRadius: string;
  border: string;
  minWidth: string;
  backgroundColor: string;
  display: string;
  justifyContent: string;
  alignItems: string;
  boxShadow: string;
  borderColor?: string;
  fontWeight?: string;
}

interface NodeData {
  label: string;
  handles?: {
    left: boolean;
    right: boolean;
  };
  style?: NodeStyle;
}

interface FlowStyles {
  width: string;
  height: string;
  background: string;
}

interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  type: string;
  opacity?: number;
}

interface GraphNode {
  id: string;
  width: number;
  height: number;
  style: NodeStyle;
  targetPosition?: Position;
  sourcePosition?: Position;
  y?: number;
}

interface MindMapProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

interface DagreNode {
  x: number;
  y: number;
  width: number;
  height: number;
  style?: NodeStyle;
  targetPosition?: Position;
  sourcePosition?: Position;
}

const nodeTypes: NodeTypes = {
  special: SpecialNode
};

const flowStyles: FlowStyles = {
  width: '100vw',
  height: '100vh',
  background: '#fafafa',
};

const colors: string[] = [
  '#0EA5E9',  // آبی روشن
  '#F97316',  // نارنجی
  '#22C55E',  // سبز
  '#D946EF',  // صورتی
  '#6366F1',  // بنفش روشن
  '#14B8A6',  // فیروزه‌ای
  '#F59E0B',  // نارنجی تیره
  '#8B5CF6',  // بنفش متوسط
  '#10B981',  // سبز زمردی
  '#3B82F6',  // آبی کلاسیک
  '#EF4444',  // قرمز روشن
  '#A855F7',  // بنفش بنفشه
  '#EC4899',  // صورتی گلی
  '#84CC16',  // سبز لیمویی
  '#06B6D4',  // آبی فیروزه‌ای
];

const nodeStyle: NodeStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '2px solid',
  minWidth: '150px',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const edgeStyle: EdgeStyle = {
  stroke: '#b1b1b7',
  strokeWidth: 2,
  type: 'smoothstep',
};

const getLayoutedElements = (nodes: Node<NodeData>[], edges: Edge[], direction: string = 'LR'): { nodes: Node<NodeData>[]; edges: Edge[] } => {
  const getNodeColor = (nodeId: string, nodes: Node<NodeData>[], edges: Edge[], rootNode: Node<NodeData>): string => {
    if (nodeId === rootNode.id) return '#4B5563';
    
    let currentId = nodeId;
    let mainBranchId: string | null = null;
    
    while (currentId !== rootNode.id) {
      const edge = edges.find(e => e.target === currentId);
      if (!edge) break;
      
      const sourceId = edge.source;
      if (sourceId === rootNode.id) {
        mainBranchId = currentId;
        break;
      }
      currentId = sourceId;
    }
    
    if (!mainBranchId) return '#4B5563';

    const mainBranches = edges
      .filter(e => e.source === rootNode.id)
      .map(e => e.target);
    
    const branchIndex = mainBranches.indexOf(mainBranchId);
    return colors[branchIndex % colors.length];
  };

  const rootNode = nodes.find(n => !edges.some(e => e.target === n.id));
  if (!rootNode) return { nodes, edges };

  const directChildren = edges
    .filter(e => e.source === rootNode.id)
    .map(e => e.target);

  const leftChildren = new Set<string>();
  const rightChildren = new Set<string>();
  
  directChildren.forEach((childId, index) => {
    if (index % 2 === 0) {
      leftChildren.add(childId);
    } else {
      rightChildren.add(childId);
    }
  });

  const getAllDescendants = (nodeId: string, visited: Set<string> = new Set()): Set<string> => {
    if (visited.has(nodeId)) return visited;
    visited.add(nodeId);
    edges
      .filter(e => e.source === nodeId)
      .forEach(e => getAllDescendants(e.target, visited));
    return visited;
  };

  leftChildren.forEach(childId => {
    getAllDescendants(childId).forEach(id => leftChildren.add(id));
  });
  rightChildren.forEach(childId => {
    getAllDescendants(childId).forEach(id => rightChildren.add(id));
  });

  const leftGraph = new dagre.graphlib.Graph();
  leftGraph.setDefaultEdgeLabel(() => ({}));
  leftGraph.setGraph({
    rankdir: 'LR',
    nodesep: 45,
    ranksep: 30,
    edgesep: 5,
    marginx: 3,
    marginy: 3,
    acyclicer: 'greedy',
    ranker: 'tight-tree',
  });

  const rightGraph = new dagre.graphlib.Graph();
  rightGraph.setDefaultEdgeLabel(() => ({}));
  rightGraph.setGraph({
    rankdir: 'LR',
    nodesep: 35,
    ranksep: 30,
    edgesep: 5,
    marginx: 3,
    marginy: 3,
    acyclicer: 'greedy',
    ranker: 'tight-tree',
  });

  nodes.forEach(node => {
    let style: NodeStyle = {
      ...nodeStyle,
    };

    if (node.id === rootNode.id) {
      style = {
        ...style,
        borderColor: '#4B5563',
        backgroundColor: '#4B556315',
        fontWeight: 'bold',
      };
    } else {
      const color = getNodeColor(node.id, nodes, edges, rootNode);
      style = {
        ...style,
        borderColor: color,
        backgroundColor: `${color}15`,
      };
    }

    const nodeData: GraphNode = {
      id: node.id,
      width: 250,
      height: 50,
      style
    };

    if (node.id === rootNode.id) {
      leftGraph.setNode(node.id, nodeData);
      rightGraph.setNode(node.id, nodeData);
    } else if (leftChildren.has(node.id)) {
      leftGraph.setNode(node.id, {
        ...nodeData,
        targetPosition: Position.Right,
        sourcePosition: Position.Left
      });
    } else if (rightChildren.has(node.id)) {
      rightGraph.setNode(node.id, {
        ...nodeData,
        targetPosition: Position.Left,
        sourcePosition: Position.Right
      });
    }
  });

  edges.forEach(edge => {
    const target = edge.target;
    if (leftChildren.has(target)) {
      leftGraph.setEdge(edge.source, edge.target);
    } else if (rightChildren.has(target)) {
      rightGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(leftGraph);
  dagre.layout(rightGraph);

  let leftSum = 0, leftCount = 0;
  let rightSum = 0, rightCount = 0;

  nodes.forEach(node => {
    if (leftChildren.has(node.id)) {
      const pos = leftGraph.node(node.id) as unknown as DagreNode;
      leftSum += pos.y;
      leftCount++;
    }
    if (rightChildren.has(node.id)) {
      const pos = rightGraph.node(node.id) as unknown as DagreNode;
      rightSum += pos.y;
      rightCount++;
    }
  });

  const leftAvg = leftCount > 0 ? leftSum / leftCount : 0;
  const rightAvg = rightCount > 0 ? rightSum / rightCount : 0;
  const centerY = (leftAvg + rightAvg) / 2;

  const layoutedNodes = nodes.map(node => {
    let nodeWithPosition: DagreNode;
    let xPos: number;
    let yPos: number;
    
    if (node.id === rootNode.id) {
      nodeWithPosition = leftGraph.node(node.id) as unknown as DagreNode;
      xPos = 0;
      yPos = centerY;
    } else if (leftChildren.has(node.id)) {
      nodeWithPosition = leftGraph.node(node.id) as unknown as DagreNode;
      xPos = -Math.abs(nodeWithPosition.x * 0.75);
      yPos = nodeWithPosition.y - leftAvg + centerY;
    } else if (rightChildren.has(node.id)) {
      nodeWithPosition = rightGraph.node(node.id) as unknown as DagreNode;
      xPos = Math.abs(nodeWithPosition.x * 0.75);
      yPos = nodeWithPosition.y - rightAvg + centerY;
    } else {
      return node;
    }

    if (node.id === rootNode.id) {
      return {
        ...node,
        type: 'special',
        data: {
          ...node.data,
          handles: {
            left: true,
            right: true
          }
        },
        style: nodeWithPosition.style,
        position: { x: xPos, y: yPos }
      };
    }

    return {
      ...node,
      style: nodeWithPosition.style,
      position: { x: xPos, y: yPos },
      targetPosition: nodeWithPosition.targetPosition,
      sourcePosition: nodeWithPosition.sourcePosition
    };
  });

  return { 
    nodes: layoutedNodes, 
    edges: edges.map(edge => {
      const isLeftBranch = leftChildren.has(edge.target);
      const isRootSource = edge.source === rootNode.id;
      
      return {
        ...edge,
        type: 'smoothstep',
        sourceHandle: isRootSource ? (isLeftBranch ? 'left' : 'right') : undefined,
        style: {
          ...edgeStyle,
          stroke: getNodeColor(edge.target, nodes, edges, rootNode),
          opacity: isRootSource ? 0.6 : 1
        }
      };
    })
  };
};

const MindMap: React.FC<MindMapProps> = ({ nodes: initialNodes = [], edges: initialEdges = [] }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (initialNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        'LR'
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [initialNodes, initialEdges]);

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    console.log('Flow loaded:', reactFlowInstance);
    reactFlowInstance.fitView();
  }, []);

  const defaultViewport: Viewport = { x: 0, y: 0, zoom: 0.8 };
  const nodeOrigin: NodeOrigin = [0.5, 0.5];
  const fitViewOptions: FitViewOptions = {
    padding: 100,
    minZoom: 0.5,
    maxZoom: 1.2,
    duration: 800
  };
  const defaultEdgeOptions: DefaultEdgeOptions = {
    type: 'smoothstep',
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
  };

  return (
    <div style={flowStyles}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        defaultViewport={defaultViewport}
        nodeOrigin={nodeOrigin}
        minZoom={0.2}
        maxZoom={2}
        fitViewOptions={fitViewOptions}
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Controls 
          position="bottom-right" 
          showInteractive={false}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '5px',
            bottom: '70px', 
            right: '20px'   
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#1a73e8" />
      </ReactFlow>
    </div>
  );
};

export default MindMap; 