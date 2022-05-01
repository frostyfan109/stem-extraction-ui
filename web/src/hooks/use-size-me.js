import { useEffect, useState } from 'react';
import { SizeMe } from 'react-sizeme';

const SizedRenderer = ({ size, currentSize, setSize, render }) => {
  useEffect(() => {
    if (
      size.width !== currentSize.width ||
      size.height !== currentSize.height
    ) {
      setSize(size);
    }
  });
  // Use currentSize to avoid components directly inside `render`
  // receiving updated sizing props before those outside of it do.
  return render({ ...currentSize });
};

export function useSizeMe(render, options) {
  const [currentSize, setSize] = useState({ width: undefined, height: undefined });

  return [
    <SizeMe {...options}>
      {({ size }) => <SizedRenderer size={size} currentSize={currentSize} setSize={setSize} render={render}/>}
    </SizeMe>,
    currentSize.width,
    currentSize.height,
  ];
}