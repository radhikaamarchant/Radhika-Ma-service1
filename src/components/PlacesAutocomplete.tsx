import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export default function PlacesAutocomplete({
  value,
  onChange,
  className,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const options = {
      componentRestrictions: { country: 'in' },
      fields: ['formatted_address', 'name', 'geometry']
    };

    const autocompleteObj = new placesLib.Autocomplete(inputRef.current, options);
    setAutocomplete(autocompleteObj);

    autocompleteObj.addListener('place_changed', () => {
      const place = autocompleteObj.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      } else if (place.name) {
        onChange(place.name);
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(autocompleteObj);
    };
  }, [placesLib, onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search location..."}
    />
  );
}
