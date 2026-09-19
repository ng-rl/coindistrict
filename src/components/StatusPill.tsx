import { RentStatus } from '../types';

interface StatusPillProps {
  status: RentStatus | 'AD';
}

export function StatusPill({ status }: StatusPillProps) {
  const styles = {
    PAID: 'bg-cd-mint-dim text-cd-mint border border-cd-mint/30',
    DUE: 'bg-cd-due/20 text-cd-due border border-cd-due/30',
    AD: 'bg-cd-ad-dim text-cd-ad border border-cd-ad/30',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}
