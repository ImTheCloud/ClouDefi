import React from "react";
import Button from "./Button";

export default function Modal({
                                  open, title, onClose, children,
                              }: React.PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) {
    if (!open) return null;

    return (
        <div className="modalBackdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h3 className="modalTitle">{title}</h3>
                    <Button onClick={onClose}>Fermer</Button>
                </div>
                {children}
            </div>
        </div>
    );
}