import React from 'react';

const mainColor = '#730C6F';
const blackColor = '#030303';

function IconCart({
                                className,
                                ...props
                            }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
        width: '29px',
        height: '24px',
    };

    return (
        <svg
            style={styles}
            viewBox="0 0 576 512"
            className={className}
            {...props}
        >
            <path
                d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"/>
        </svg>
    );
}

function IconMenu({
                      className,
                      ...props
                  }: React.ComponentProps<'svg'>) {
    const styles = {
        color: '#030303',
        fill: '#030303',
        width: '28px',
        height: '24px',
    };

    return (
        <svg
            style={styles}
            viewBox="0 0 448 512"
            className={`${className} hover:fill-current`}
            {...props}
        >
            <path
                d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"/>
        </svg>
    );
}

function IconStar({
                      className,
                      ...props
                  }: React.ComponentProps<'svg'>) {
    const styles = {
        color: mainColor,
        fill: mainColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className} w-5 h-5 cm:w-6 cm:h-6`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z">
            </path>
        </svg>
    );
}

function IconPlus({
                      className,
                      ...props
                  }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className}`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z">
            </path>
        </svg>
    );
}

function IconLocation({
                      className,
                      ...props
                  }: React.ComponentProps<'svg'>) {
    const styles = {
        color: mainColor,
        fill: mainColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className} w-5 h-5 cm:w-6 cm:h-6`}>
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z">
            </path>
        </svg>
    );
}

function IconThreeDots({
                          className,
                          ...props
                      }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
        width: '30px',
        height: '30px',
    };

    return (
        <svg style={styles} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z">
            </path>
        </svg>
    );
}

function IconChevronDown({
                           className,
                           ...props
                       }: React.ComponentProps<'svg'>) {
    const styles = {
        color: blackColor,
        fill: blackColor,
    };

    return (
        <svg style={styles} viewBox="0 0 24 24" className={`${className} w-5 h-5 cm:w-6 cm:h-6`}>
            <path d="M0 0h24v24H0V0z" fill="none">
            </path>
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
        </svg>
    );
}


export {
    IconCart,
    IconMenu,
    IconStar,
    IconLocation,
    IconThreeDots,
    IconChevronDown,
    IconPlus
};