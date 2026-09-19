import { CityScene } from './city/CityScene';

function App() {
  return (
    <>
      <CityScene />
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          pointerEvents: 'auto',
        }}>
          <div style={{
            background: 'rgba(10, 10, 30, 0.8)',
            border: '1px solid rgba(74, 144, 226, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            backdropFilter: 'blur(10px)',
          }}>
            <h1 style={{
              color: '#4a90e2',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
              CoinDistrict
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              margin: 0,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
              Night City Financial District
            </p>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          pointerEvents: 'auto',
        }}>
          <div style={{
            background: 'rgba(10, 10, 30, 0.8)',
            border: '1px solid rgba(74, 144, 226, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: '#4a90e2' }}>BTC:</span> $45,234.12
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: '#4a90e2' }}>ETH:</span> $3,456.78
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: '#4a90e2' }}>PAID:</span> $0.42
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: '#4a90e2' }}>DUE:</span> $1.23
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          pointerEvents: 'auto',
        }}>
          <div style={{
            background: 'rgba(10, 10, 30, 0.8)',
            border: '1px solid rgba(74, 144, 226, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              marginBottom: '8px',
            }}>
              Legend
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#4a90e2',
                  boxShadow: '0 0 8px #4a90e2',
                  borderRadius: '2px',
                }} />
                <span style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                  Lit Buildings
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#ffcc00',
                  boxShadow: '0 0 8px #ffcc00',
                  borderRadius: '2px',
                }} />
                <span style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                  Streetlights
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
