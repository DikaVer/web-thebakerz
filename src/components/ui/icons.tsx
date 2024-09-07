import React from 'react';

const colors = {
    primary: '#730C6F', //'#730C6F'
    secondary: '#F8CE87', //'#F8CE87'
    black: '#000000',
    heart: '#ce2751'
};

function IconCart({
                      className,
                      color = 'black', // default color
                      viewBox = "0 0 576 512",
                      ...props
                  }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path
                d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"/>
        </svg>
    );
}

function IconMenu({
                      className,
                      color = 'black', // default color
                      viewBox = "0 0 448 512",
                      ...props
                  }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path
                d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"/>
        </svg>
    );
}

function IconStar({
                      className,
                      color = 'black', // default color
                      viewBox = "0 0 24 24",
                      ...props
                  }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
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
                      color = 'black', // default color
                      viewBox = "0 0 24 24",
                      ...props
                  }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z">
            </path>
        </svg>
    );
}

function IconLocation({
                          className,
                          color = 'black', // default color
                          viewBox = "0 0 24 24",
                          ...props
                      }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none"/>
            <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"
            />
        </svg>
    );
}

function IconThreeDots({
                           className,
                           color = 'black', // default color
                           viewBox = "0 0 24 24",
                           ...props
                       }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
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
                             color = 'black', // default color
                             viewBox = "0 0 24 24",
                             ...props
                         }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0V0z" fill="none">
            </path>
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
        </svg>
    );
}

function IconBill({
                      className,
                      color = 'black', // default color
                      viewBox = "0 0 24 24",
                      ...props
                  }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z">
            </path>
        </svg>
    );
}

function IconSupport({
                         className,
                         color = 'black', // default color
                         viewBox = "0 0 24 24",
                         ...props
                     }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path
                d="M21 12.22C21 6.73 16.74 3 12 3c-4.69 0-9 3.65-9 9.28-.6.34-1 .98-1 1.72v2c0 1.1.9 2 2 2h1v-6.1c0-3.87 3.13-7 7-7s7 3.13 7 7V19h-8v2h8c1.1 0 2-.9 2-2v-1.22c.59-.31 1-.92 1-1.64v-2.3c0-.7-.41-1.31-1-1.62z">
            </path>
            <path d="M9 12a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM15 12a1 1 0 1 0 0 2 1 1 0 1 0 0-2z">
            </path>
            <path
                d="M18 11.03A6.04 6.04 0 0 0 12.05 6c-3.03 0-6.29 2.51-6.03 6.45a8.075 8.075 0 0 0 4.86-5.89c1.31 2.63 4 4.44 7.12 4.47z">
            </path>
        </svg>
    );
}

function IconPayment({
                         className,
                         color = 'black', // default color
                         viewBox = "0 0 24 24",
                         ...props
                     }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path
                d="M18 4H6C3.79 4 2 5.79 2 8v8c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-1.86 9.77c-.24.2-.57.28-.88.2L4.15 11.25C4.45 10.52 5.16 10 6 10h12c.67 0 1.26.34 1.63.84l-3.49 2.93zM6 6h12c1.1 0 2 .9 2 2v.55c-.59-.34-1.27-.55-2-.55H6c-.73 0-1.41.21-2 .55V8c0-1.1.9-2 2-2z">
            </path>
        </svg>
    );
}

function IconAvatar({
                        className,
                        color = 'black', // default color
                        viewBox = "0 0 24 24",
                        ...props
                    }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20z">
            </path>
        </svg>
    );
}

function IconTrash({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z">
            </path>
        </svg>
    );
}

function IconMinus({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path d="M19 13H5v-2h14v2z">
            </path>
        </svg>
    );
}

function IconCross({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
            </path>
        </svg>
    );
}

function IconEdit({
                      className,
                      color = 'black', // default color
                      viewBox = "0 0 24 24",
                      ...props
                  }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z">
            </path>
        </svg>
    );
}

function IconClock({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z">
            </path>
            <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z">
            </path>
        </svg>
    );
}

function IconArrow({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path fill="none" d="M0 0h24v24H0z">
            </path>
            <path d="m9 19 1.41-1.41L5.83 13H22v-2H5.83l4.59-4.59L9 5l-7 7 7 7z">
            </path>
        </svg>
    );
}

function IconStore({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };
    // "0 0 576 512"
    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path
                d="M495.5 223.2C491.6 223.7 487.6 224 483.4 224C457.4 224 434.2 212.6 418.3 195C402.4 212.6 379.2 224 353.1 224C327 224 303.8 212.6 287.9 195C272 212.6 248.9 224 222.7 224C196.7 224 173.5 212.6 157.6 195C141.7 212.6 118.5 224 92.36 224C88.3 224 84.21 223.7 80.24 223.2C24.92 215.8-1.255 150.6 28.33 103.8L85.66 13.13C90.76 4.979 99.87 0 109.6 0H466.4C476.1 0 485.2 4.978 490.3 13.13L547.6 103.8C577.3 150.7 551 215.8 495.5 223.2H495.5zM499.7 254.9C503.1 254.4 508 253.6 512 252.6V448C512 483.3 483.3 512 448 512H128C92.66 512 64 483.3 64 448V252.6C67.87 253.6 71.86 254.4 75.97 254.9L76.09 254.9C81.35 255.6 86.83 256 92.36 256C104.8 256 116.8 254.1 128 250.6V384H448V250.7C459.2 254.1 471.1 256 483.4 256C489 256 494.4 255.6 499.7 254.9L499.7 254.9z">
            </path>
        </svg>
    );
}

function IconOrder({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };
    // "0 0 384 512"
    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path
                d="M336 64h-53.88C268.9 26.8 233.7 0 192 0S115.1 26.8 101.9 64H48C21.5 64 0 85.48 0 112v352C0 490.5 21.5 512 48 512h288c26.5 0 48-21.48 48-48v-352C384 85.48 362.5 64 336 64zM96 392c-13.25 0-24-10.75-24-24S82.75 344 96 344s24 10.75 24 24S109.3 392 96 392zM96 296c-13.25 0-24-10.75-24-24S82.75 248 96 248S120 258.8 120 272S109.3 296 96 296zM192 64c17.67 0 32 14.33 32 32c0 17.67-14.33 32-32 32S160 113.7 160 96C160 78.33 174.3 64 192 64zM304 384h-128C167.2 384 160 376.8 160 368C160 359.2 167.2 352 176 352h128c8.801 0 16 7.199 16 16C320 376.8 312.8 384 304 384zM304 288h-128C167.2 288 160 280.8 160 272C160 263.2 167.2 256 176 256h128C312.8 256 320 263.2 320 272C320 280.8 312.8 288 304 288z">
            </path>
        </svg>
    );
}

function IconMessage({
                         className,
                         color = 'black', // default color
                         viewBox = "0 0 24 24",
                         ...props
                     }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    //"0 0 24 24"
    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path d="M0 0h24v24H0z" fill="none">
            </path>
            <path
                d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z">
            </path>
        </svg>
    );
}

function IconHeart({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 24 24",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' | 'heart' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    //"0 0 512 512"
    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path
                d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z">
            </path>
        </svg>
    );
}

function IconSuccess({
                       className,
                       color = 'black', // default color
                       viewBox = "0 0 20 20",
                       ...props
                   }: React.ComponentProps<'svg'> & { color?: 'primary' | 'secondary' | 'black' | 'heart' }) {
    const styles = {
        color: colors[color],
        fill: colors[color],
    };

    //"0 0 512 512"
    return (
        <svg style={styles}
             viewBox={viewBox}
             className={`${className}`}
             {...props}
        >
            <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clip-rule="evenodd"></path>
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
    IconPlus,
    IconBill,
    IconSupport,
    IconPayment,
    IconAvatar,
    IconTrash,
    IconMinus,
    IconCross,
    IconEdit,
    IconClock,
    IconArrow,
    IconStore,
    IconOrder,
    IconMessage,
    IconHeart,
    IconSuccess
};