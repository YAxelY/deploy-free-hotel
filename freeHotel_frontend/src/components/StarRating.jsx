import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function StarRating({ value = 0, onChange, disabled = false, label = '', showValue = false }) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                    key={star}
                    icon={['fas', 'star']}
                    onClick={() => !disabled && onChange && onChange(star)}
                    onMouseEnter={() => !disabled && setHovered(star)}
                    onMouseLeave={() => !disabled && setHovered(0)}
                    style={{
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        color: active >= star ? '#FFC107' : '#e4e5e9',
                        fontSize: '2rem',
                        marginRight: '0.5rem',
                        transition: 'color 200ms'
                    }}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                />
            ))}
            {showValue && (
                <span style={{ marginLeft: '1rem', color: '#222', fontWeight: 500 }}>
                    {value ? `${value} out of 5` : 'Select a rating'}
                </span>
            )}
            {label && <span style={{ marginLeft: 16, fontSize: 20, color: '#444' }}>{label}</span>}
        </div>
    );
} 