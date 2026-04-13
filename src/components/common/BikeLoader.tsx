import React from 'react';

const BikeLoader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
            <div className="relative w-32 h-20">
                {/* Bicycle SVG */}
                <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Frame */}
                    <path d="M40,105 L80,105 L120,45 L70,45 L40,105 Z" className="text-foreground" fill="none" />
                    <path d="M120,45 L150,105" className="text-foreground" />
                    <path d="M70,45 L40,15" className="text-foreground" />
                    <path d="M25,15 L55,15" className="text-foreground" /> {/* Handlebars */}
                    <path d="M75,35 L85,35" className="text-foreground" /> {/* Seat */}

                    {/* Back Wheel */}
                    <g className="animate-[spin_1.5s_linear_infinite] origin-[40px_105px]">
                        <circle cx="40" cy="105" r="30" className="text-primary" />
                        <path d="M40,105 L40,75" className="text-muted-foreground/30" strokeWidth="2" />
                        <path d="M40,105 L66,120" className="text-muted-foreground/30" strokeWidth="2" />
                        <path d="M40,105 L14,120" className="text-muted-foreground/30" strokeWidth="2" />
                    </g>

                    {/* Front Wheel */}
                    <g className="animate-[spin_1.5s_linear_infinite] origin-[150px_105px]">
                        <circle cx="150" cy="105" r="30" className="text-secondary" />
                        <path d="M150,105 L150,75" className="text-muted-foreground/30" strokeWidth="2" />
                        <path d="M150,105 L176,120" className="text-muted-foreground/30" strokeWidth="2" />
                        <path d="M150,105 L124,120" className="text-muted-foreground/30" strokeWidth="2" />
                    </g>
                </svg>
            </div>
            <div className="flex flex-col items-center gap-1">
                <h3 className="text-lg font-semibold text-foreground animate-pulse">
                    Loading
                </h3>
                <p className="text-sm text-muted-foreground">
                    Đang đạp xe nhanh hơn...
                </p>
            </div>
        </div>
    );
};

export default BikeLoader;
