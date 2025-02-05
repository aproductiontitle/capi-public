import { Handle, Position } from '@xyflow/react';

const GreetingNode = ({ data }: { data: { message: string } }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 min-w-[200px]">
      <div className="font-medium mb-2">Greeting</div>
      <p className="text-sm text-gray-600">{data.message}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary"
      />
    </div>
  );
};

export default GreetingNode;