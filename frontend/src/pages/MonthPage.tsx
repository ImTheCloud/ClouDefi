import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {MonthlyChallenge, MonthlyChallengeCheck} from "../lib/types";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

function todayISO() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function monthKeyFrom(dateISO: string) { return dateISO.slice(0, 7); }

export default function MonthPage() {
    const [date, setDate] = useState(todayISO());
    const [challenges, setChallenges] = useState<MonthlyChallenge[]>([]);
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [newTitle, setNewTitle] = useState("");

    const monthKey = useMemo(() => monthKeyFrom(date), [date]);
    const ids = useMemo(() => challenges.map(c => c.id), [challenges]);

    async function loadChallenges() {
        const { data, error } = await supabase
            .from("monthly_challenges")
            .select("*")
            .eq("month_key", monthKey)
            .order("created_at", { ascending: false });

        if (error) return alert(error.message);
        setChallenges((data ?? []) as MonthlyChallenge[]);
    }

    async function loadChecks() {
        if (ids.length === 0) { setChecks({}); return; }
        const { data, error } = await supabase
            .from("monthly_challenge_checks")
            .select("*")
            .eq("check_date", date);

        if (error) return alert(error.message);

        const map: Record<string, boolean> = {};
        for (const row of (data ?? []) as MonthlyChallengeCheck[]) map[row.challenge_id] = row.done;
        setChecks(map);
    }

    useEffect(() => { loadChallenges(); /* eslint-disable-next-line */ }, [monthKey]);
    useEffect(() => { loadChecks(); /* eslint-disable-next-line */ }, [date, ids.join(",")]);

    async function addChallenge() {
        const title = newTitle.trim();
        if (!title) return;

        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;

        const { error } = await supabase.from("monthly_challenges").insert({
            user_id: user.id,
            month_key: monthKey,
            title,
        });
        if (error) return alert(error.message);

        setNewTitle("");
        await loadChallenges();
    }

    async function toggle(challengeId: string, next: boolean) {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;

        setChecks(prev => ({ ...prev, [challengeId]: next }));

        const { error } = await supabase.from("monthly_challenge_checks").upsert({
            user_id: user.id,
            challenge_id: challengeId,
            check_date: date,
            done: next,
        }, { onConflict: "challenge_id,check_date" });

        if (error) return alert(error.message);
    }

    async function del(id: string) {
        if (!confirm("Supprimer ce challenge ?")) return;
        const { error } = await supabase.from("monthly_challenges").delete().eq("id", id);
        if (error) return alert(error.message);
        await loadChallenges();
        await loadChecks();
    }

    return (
        <div className="gridGap">
            <Card>
                <div className="row">
                    <div>
                        <h2 className="pageTitle">Mois</h2>
                        <p className="pageSub">Challenges du mois : {monthKey}. Coche par date.</p>
                    </div>
                    <label className="field" style={{ minWidth: 220 }}>
                        <span className="label">Date</span>
                        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>
                </div>
            </Card>

            <Card>
                <div className="row" style={{ alignItems: "end" }}>
                    <Input label="Ajouter un challenge" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Janvier : 0 shorts" />
                    <Button variant="primary" onClick={addChallenge} disabled={!newTitle.trim()}>Ajouter</Button>
                </div>

                <div style={{ height: 10 }} />

                {challenges.length === 0 ? (
                    <div className="pageSub">Aucun challenge pour ce mois. Ajoute-en 1 ou 2.</div>
                ) : (
                    <div className="list">
                        {challenges.map(c => (
                            <div key={c.id} className="item">
                                <div>
                                    <div className="itemTitle">{c.title}</div>
                                    <div className="itemSub">Mois : {monthKey}</div>
                                </div>

                                <div className="actions">
                                    <label className="pageSub" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <input
                                            className="checkbox"
                                            type="checkbox"
                                            checked={!!checks[c.id]}
                                            onChange={(e) => toggle(c.id, e.target.checked)}
                                        />
                                        Fait
                                    </label>
                                    <Button variant="danger" onClick={() => del(c.id)}>Suppr</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}