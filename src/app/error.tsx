'use client';

import React from 'react';

export default function Error({ error, reset } : { error: Error, reset: () => void }) {
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>Something went wrong!</h1>
            <p>{error.message}</p>
            <button onClick={() => reset()}>Try again</button>
        </div>
    );
}