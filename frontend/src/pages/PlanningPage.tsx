import Card from "../components/Card";

export default function PlanningPage() {
    const rows = [
        ["Lundi", "Lecture"],
        ["Mardi", "Renforcement musculaire"],
        ["Mercredi", "Course"],
        ["Jeudi", "Lecture"],
        ["Vendredi", "Renforcement musculaire"],
        ["Samedi", "Course"],
        ["Dimanche", "Repos"],
    ];

    return (
        <div className="gridGap">
            <Card>
                <h2 className="pageTitle">Planning</h2>
                <p className="pageSub">Affichage simple, clair, sans réglages pour l’instant.</p>

                <div className="list" style={{ marginTop: 12 }}>
                    {rows.map(([d, t]) => (
                        <div key={d} className="item">
                            <div className="itemTitle">{d}</div>
                            <div className="pageSub">{t}</div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 12 }} className="pageSub">
                    <b>Journalier :</b> Bible + 1 verset (Psaumes)
                </div>
            </Card>
        </div>
    );
}