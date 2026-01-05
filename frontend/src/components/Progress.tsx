export default function Progress({ value }: { value: number }) {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    return (
        <div className="progress">
            <div className="progressFill" style={{ width: `${v}%` }} />
        </div>
    );
}