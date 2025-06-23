/* eslint-disable react/prop-types */
const PropertyTypeFilter = ({ setFilterPropertyInput }) => {
  const AddInput = (value) => {
    setFilterPropertyInput(value);
  };

  return (
    <div className="absolute left-0 z-10 flex justify-between w-full bg-white border border-gray-300 rounded-md  top-9">
      <ul className="flex flex-col w-full gap-3">
        <div
          className="p-1 hover:cursor-pointer hover:bg-blue-500"
          onClick={() => AddInput("Commercial")}
        >
          <li>Commercial</li>
        </div>

        <div
          className="p-1 hover:cursor-pointer hover:bg-blue-500"
          onClick={() => {
            AddInput("Office Space");
          }}
        >
          <li>Office Space</li>
        </div>

        <div
          className="p-1 hover:cursor-pointer hover:bg-blue-500"
          onClick={() => {
            AddInput("Industrial Building");
          }}
        >
          <li>Industrial Building</li>
        </div>

        <div
          className="p-1 hover:cursor-pointer hover:bg-blue-500"
          onClick={() => {
            AddInput("Goddown/Warehouse");
          }}
        >
          <li>Gowdown/Warehouse</li>
        </div>

        <div
          className="p-1 hover:cursor-pointer hover:bg-blue-500"
          onClick={() => {
            AddInput("Showroom");
          }}
        >
          <li>Showroom</li>
        </div>

        <div
          className="p-1 hover:cursor-pointer hover:bg-blue-500"
          onClick={() => {
            AddInput("Other Business");
          }}
        >
          <li>Other Business</li>
        </div>
      </ul>
    </div>
  );
};

export default PropertyTypeFilter;
