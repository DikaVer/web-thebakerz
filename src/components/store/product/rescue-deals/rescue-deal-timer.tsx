'use client';
import React, { useState, useEffect } from 'react';
import { Progress } from '@heroui/react';
import { Icon } from '@iconify/react';
import { getTimeUntilClosing } from '@/lib/utils/helper/schedule-utils';
import { useDelivery } from '@/components/providers/delivery-provider';

interface RescueDealTimerProps {
    schedule: any;
}

export const RescueDealTimer: React.FC<RescueDealTimerProps> = ({ schedule }) => {
    const [timeData, setTimeData] = useState<ReturnType<typeof getTimeUntilClosing>>(null);
    const [mounted, setMounted] = useState(false);
    const { isRescueDeal, toggleRescueDealMode } = useDelivery();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const updateTimer = () => {
            const data = getTimeUntilClosing(schedule);
            setTimeData(data);
        };

        // Update immediately
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [schedule, mounted]);

    if (!mounted || !timeData?.isActive) return null;

    // Calculate urgency level for dynamic styling
    const isUrgent = timeData.percentage < 30; // Less than 30% time remaining
    const isCritical = timeData.percentage < 15; // Less than 15% time remaining
    const isVeryUrgent = timeData.timeRemaining <= 5; // Less than 5 minutes remaining

    // Format time display
    const formatMainTime = () => {
        if (timeData.hours > 0) {
            return `${timeData.hours}h ${timeData.minutes}m`;
        } else if (timeData.minutes > 0) {
            return `${timeData.minutes}m`;
        } else {
            return `${timeData.seconds}s`;
        }
    };

    const shouldShowSeconds = timeData.hours === 0; // Only show seconds when less than 1 hour

    return (
        <div className={`cursor-pointer relative w-full mx-auto mb-6 rounded-2xl p-4 backdrop-blur-md transition-all duration-300 overflow-hidden ${
            isVeryUrgent 
                ? 'bg-gradient-to-r from-danger-600/30 to-danger-500/30 border-2 border-danger-500/50 shadow-xl shadow-danger-500/30' 
                : isCritical 
                ? 'bg-gradient-to-r from-danger-500/20 to-warning-500/20 border-2 border-danger-500/30 shadow-lg shadow-danger-500/20' 
                : isUrgent 
                ? 'bg-gradient-to-r from-warning-500/20 to-primary-500/20 border-2 border-warning-500/30 shadow-lg shadow-warning-500/10'
                : 'bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 shadow-md'
        }`}
        onClick={() => toggleRescueDealMode(!isRescueDeal)}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full transition-all duration-300 ${
                        isVeryUrgent ? 'bg-danger-600 animate-pulse' 
                        : isCritical ? 'bg-danger-500 animate-pulse' 
                        : isUrgent ? 'bg-warning-500' 
                        : 'bg-primary-500'
                    }`}>
                        <Icon icon="solar:fire-bold" className="text-white" width={16} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg leading-tight ${
                            isVeryUrgent ? 'text-danger-700 animate-pulse' 
                            : isCritical ? 'text-danger-600' 
                            : isUrgent ? 'text-warning-600' 
                            : 'text-primary-600'
                        }`}>
                            🔥 Rescue Deals Ending Soon!
                        </h3>
                        <p className="text-xs text-default-500 font-medium">
                            {isVeryUrgent ? "Last chance!" : "Grab them before they're gone"}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full font-bold transition-all duration-300 ${
                    isVeryUrgent 
                        ? 'bg-danger-200 text-danger-800 animate-bounce shadow-lg text-base' 
                        : isCritical 
                        ? 'bg-danger-100 text-danger-700 animate-pulse shadow-md text-sm' 
                        : isUrgent 
                        ? 'bg-warning-100 text-warning-700 shadow-sm text-sm'
                        : 'bg-primary-100 text-primary-700 text-sm'
                }`}>
                    <div className="flex items-center gap-1">
                        <span>{formatMainTime()}</span>
                        {shouldShowSeconds && (
                            <span className={`${isVeryUrgent || isCritical ? 'animate-pulse' : ''} text-xs opacity-80`}>
                                {timeData.seconds}s
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3 relative z-10">
                <Progress
                    size="lg"
                    value={100 - timeData.percentage} // Inverted to show progress toward ending
                    color={isVeryUrgent ? "danger" : isCritical ? "danger" : isUrgent ? "warning" : "primary"}
                    className="w-full"
                    classNames={{
                        base: "max-w-full",
                        track: "drop-shadow-md border border-default",
                        indicator: isVeryUrgent || isCritical ? "animate-pulse" : "",
                        value: "text-foreground/60 text-xs font-medium"
                    }}
                    showValueLabel={false}
                />
            </div>

            {/* Bottom Text */}
            <div className="flex items-center justify-between text-xs relative z-10">
                <span className={`font-medium ${isVeryUrgent ? 'text-danger-600 animate-pulse' : 'text-default-600'}`}>
                    ⚡ {isVeryUrgent ? "ENDING NOW!" : "Limited time offers expiring at store closing"}
                </span>
            </div>

            {/* Enhanced pulsing effects for critical states */}
            {isVeryUrgent && (
                <>
                    <div className="absolute inset-0 rounded-2xl border-2 border-danger-500 animate-ping opacity-40 pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-2xl border-4 border-danger-400 animate-pulse opacity-20 pointer-events-none"></div>
                </>
            )}
            {isCritical && !isVeryUrgent && (
                <div className="absolute inset-0 rounded-2xl border-2 border-danger-400 animate-ping opacity-20 pointer-events-none"></div>
            )}

            {/* Enhanced shimmer effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 ${
                isVeryUrgent ? 'animate-pulse' : 'animate-shimmer'
            } opacity-30`}></div>

            {/* Rescue Deals "Check it out" switcher - only show when not in rescue deal mode */}
            {!isRescueDeal && (
                <div className="absolute bottom-2 right-2 z-20">
                    <button
                        onClick={() => toggleRescueDealMode(!isRescueDeal)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition-all duration-300 hover:scale-105 ${
                            isVeryUrgent 
                                ? 'bg-white/90 text-danger-700 shadow-lg border border-danger-200 hover:bg-white' 
                                : isCritical 
                                ? 'bg-white/80 text-danger-600 shadow-md border border-danger-100 hover:bg-white/90'
                                : isUrgent 
                                ? 'bg-white/70 text-warning-600 shadow-sm border border-warning-100 hover:bg-white/80'
                                : 'bg-white/60 text-primary-600 border border-primary-100 hover:bg-white/70'
                        }`}
                    >
                        <Icon icon="material-symbols:eco-outline" width={14} />
                        <span>Check it out</span>
                        <Icon icon="solar:arrow-right-linear" width={12} />
                    </button>
                </div>
            )}
        </div>
    );
};
