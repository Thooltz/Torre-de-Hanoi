import './Disk.css';

interface DiskProps {
  size: number;
  totalDisks: number;
}

export default function Disk({ size, totalDisks }: DiskProps) {
  return (
    <div className={`disk size-${size}`}>
      <span className="disk-text">{size}</span>
    </div>
  );
}

