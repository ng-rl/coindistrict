import { ReactNode } from 'react';

interface PhoneStageProps {
  children: ReactNode;
}

export function PhoneStage({ children }: PhoneStageProps) {
  return (
    <div className="phone-stage min-h-screen bg-cd-bg flex items-center justify-center p-4">
      <div 
        className="phone-frame w-full max-w-[420px] h-screen max-h-[896px] bg-cd-bg overflow-hidden flex flex-col"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {children}
      </div>
      
      <style>{`
        @media (max-width: 420px) {
          .phone-stage {
            padding: 0;
          }
          .phone-frame {
            max-width: 100%;
            max-height: 100vh;
            height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}
