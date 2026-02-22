import React from 'react';

const Logo = ({ size = 'medium', light = false }) => {
    const scale = size === 'small' ? 0.6 : size === 'large' ? 1.1 : size === 'xlarge' ? 1.3 : 0.9;
    const color = light ? 'white' : 'var(--secondary)';
    const gold = '#D4AF37'; // Champagne Gold

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            fontFamily: "'Cinzel', serif"
        }}>
            {/* Ultra-Premium Monogram Frame */}
            <div style={{ position: 'relative', width: '45px', height: '45px' }}>
                <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Octagonal Frame */}
                    <path d="M50 5L85 15L95 50L85 85L50 95L15 85L5 50L15 15L50 5Z" stroke={gold} strokeWidth="2" />
                    <path d="M50 10L80 20L88 50L80 80L50 90L20 80L12 50L20 20L50 10Z" stroke={color} strokeWidth="1" opacity="0.3" />

                    {/* Intertwined AC Monogram */}
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill={gold} fontSize="35" fontWeight="400" fontFamily="'Playfair Display', serif" style={{ letterSpacing: '-2px' }}>
                        AC
                    </text>
                </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    color: color,
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>Aishwarya</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ height: '1px', background: gold, flex: 1 }}></div>
                    <span style={{
                        fontSize: '0.6rem',
                        letterSpacing: '5px',
                        textTransform: 'uppercase',
                        color: gold,
                        fontWeight: '700'
                    }}>Collections</span>
                    <div style={{ height: '1px', background: gold, flex: 1 }}></div>
                </div>
            </div>
        </div>
    );
};

export default Logo;
