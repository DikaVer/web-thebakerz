import '@/styles/gradient-text.css';

export interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    colors?: string[];
    subClassName?: string;
    animationSpeed?: number;
    showBorder?: boolean;
}

export default function GradientText({
                                         children,
                                         className = "",
                                            subClassName = "",
                                         colors=["#a2119d", "#730C6F", "#a2119d", "#730C6F", "#a2119d"],
                                         animationSpeed = 8,
                                         showBorder = false,
}: GradientTextProps) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        animationDuration: `${animationSpeed}s`,
    };

    return (
        <div className={`animated-gradient-text ${className}`}>
            {showBorder && <div className={`gradient-overlay cursor-default ${subClassName}`} style={gradientStyle}></div>}
            <div className={`text-content cursor-default ${subClassName}`} style={gradientStyle}>{children}</div>
        </div>
    );
}