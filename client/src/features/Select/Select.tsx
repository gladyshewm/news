import './Select.css';
import { useState } from 'react';

interface SelectProps {
  options: string[];
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
}

const Select = ({
  options,
  selectedOption,
  setSelectedOption,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="custom-select">
      <div className="select-header" onClick={() => setIsOpen((prev) => !prev)}>
        {selectedOption || 'Select an option'}
      </div>
      {isOpen && (
        <ul className="select-options">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                setSelectedOption(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
