import { Handle, Position } from '@xyflow/react';

const ConditionNode = ({ data }: { data: { condition: string } }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 min-w-[200px]">
      <div className="font-medium mb-2">Condition</div>
      <p className="text-sm text-gray-600">{data.condition}</p>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-red-500"
      />
    </div>
  );
};

export default ConditionNode;