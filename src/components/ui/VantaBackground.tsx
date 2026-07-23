/**
 * @fileoverview Animated fog background powered by Vanta.js.
 *
 * Exports VantaBackground, which dynamically loads three.js and the Vanta fog
 * effect from CDNs at runtime and initializes the purple-toned fog animation
 * on a wrapper div rendered behind its children.
 */
'use client';
import React, { useEffect } from 'react';

const loadScript = (src: any) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

interface VantaBackgroundProps {
    children?: React.ReactNode;
}

const VantaBackground: React.FC<VantaBackgroundProps> = ({children }) => {
    useEffect(() => {
        const loadVanta = async () => {
            try {
                // Load required scripts
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
                await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js');
                //@ts-ignore
                if (window.VANTA) {
                    //@ts-ignore
                    window.VANTA.FOG({
                        el: "#vanta-bg",
                        mouseControls: true,
                        touchControls: true,
                        gyroControls: false,
                        minHeight: 1,
                        minWidth: 1,
                        highlightColor: 0xe000ff,
                        midtoneColor: 0x8600ff,
                        lowlightColor: 0xb400ff,
                        baseColor: 0xffffff,
                        blurFactor: 0.90,
                        speed: 2.00
                    });
                }
            } catch (error) {
                console.error('Error loading scripts:', error);
            }
        };

        loadVanta();
    }, []);

    return (
        <div id="vanta-bg"
             className="w-full "
             style={{
                 height: 'fit-content',
                 // borderRadius: '20px',
                 overflow: "hidden"
             }}>
            {children}
        </div>
    );
};

export default VantaBackground;
