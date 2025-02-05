import { Handle, Position } from '@xyflow/react';

const ResponseNode = ({ data }: { data: { model: string; temperature: number } }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 min-w-[200px]">
      <div className="font-medium mb-2">AI Response</div>
      <div className="text-sm text-gray-600">
        <div>Model: {data.model}</div>
        <div>Temperature: {data.temperature}</div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary"
      />
    </div>
  );
};

export default ResponseNode;