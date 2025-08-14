 
export default function Sidebar() {
  return (
    <div className='w-[250px] border-r border-gray-300 bg-white p-2 overflow-y-auto'>
      <h2 className='font-semibold mb-2'>Resource Tree</h2>
      <ul className='text-sm space-y-1'>
        <li>Programme</li>
        <li>Permanent Resources</li>
        <li>Consumable Resources</li>
        <li>Cost Centres</li>
      </ul>
    </div>
  );
}
