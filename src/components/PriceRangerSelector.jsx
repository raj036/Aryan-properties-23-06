import  { useState } from 'react';
import Slider from '@mui/material/Slider';
import { Box } from '@mui/material';

const PriceRangeSelector = () => {
  const MIN_PRICE = 100;
  const MAX_PRICE = 10000;
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [anyPrice, setAnyPrice] = useState(false);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleAnyPriceChange = (e) => {
    setAnyPrice(e.target.checked);
    if (e.target.checked) {
      setPriceRange([MIN_PRICE, MAX_PRICE]);
    }
  };

  return (
    <div className="w-full max-w-sm p-4">

      {/* MUI Slider Component */}
      <Box sx={{ width: '100%', paddingBottom: '1rem' }}>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `$${value.toLocaleString()}`}
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={100}
          disabled={anyPrice}
          sx={{
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              backgroundColor: 'blue',
              borderRadius: '50%',
            },
            '& .MuiSlider-rail': {
              opacity: 0.2,
            },
            '& .MuiSlider-track': {
              backgroundColor: 'blue',
            },
          }}
        />
      </Box>

      {/* Dynamic price labels under each handle */}
      <div className="flex items-center justify-between text-sm text-gray-500 -mt-4">
        <div>${priceRange[0].toLocaleString()}</div>
        <div>${priceRange[1].toLocaleString()}</div>
      </div>

      {/* Any price checkbox */}

      <div className='flex gap-3 mt-6'>
        <input type="checkbox" className="w-4 h-4 accent-blue-900 hover:cursor-pointer"checked={anyPrice}
            onChange={handleAnyPriceChange} />
        <h1>Any Price</h1>
      </div>
      
    </div>
  );
};

export default PriceRangeSelector;