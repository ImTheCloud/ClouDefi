import React from "react";

type Props = React.PropsWithChildren<{
    onClick?: () => void;
    type?: "button" | "submit";
    variant?: "primary" | "danger" | "ghost";
    disabled?: boolean;
    className?: string;
}>;

export default function Button({ children, onClick, type="button", variant="ghost", disabled, className }: Props) {
    const variantClass =
        variant === "primary" ? "btnPrimary" :
            variant === "danger" ? "btnDanger" :
                "";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn ${variantClass} ${className ?? ""}`}
        >
            {children}
        </button>
    );
}