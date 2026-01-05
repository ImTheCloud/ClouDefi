import React from "react";

export default function Input(
    props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
) {
    const { label, className, ...rest } = props;
    return (
        <label className="field">
            {label ? <span className="label">{label}</span> : null}
            <input className={`input ${className ?? ""}`} {...rest} />
        </label>
    );
}