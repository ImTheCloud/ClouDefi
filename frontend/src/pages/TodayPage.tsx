import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {Habit, HabitCheck} from "../lib/types";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

function todayISO() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function TodayPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [date, setDate] = useState(todayISO());
    const [newHabit, setNewHabit] = useState("");

    const habitIds = useMemo(() => habits.map(h => h.id), [habits]);

    async function loadHabits() {
        const { data, error } = await supabase.from("habits").select("*").order("created_at", { ascending: false });
        if (error) return alert(error.message);
        setHabits((data ?? []) as Habit[]);
    }

    async function loadChecks() {
        if (habitIds.length === 0) { setChecks({}); return; }
        const { data, error } = await supabase
            .from("habit_checks")
            .select("*")
            .eq("check_date", date);

        if (error) return alert(error.message);

        const map: Record<string, boolean> = {};
        for (const row of (data ?? []) as HabitCheck[]) map[row.habit_id] = row.done;
        setChecks(map);
    }

    useEffect(() => { loadHabits(); }, []);
    useEffect(() => { loadChecks(); /* eslint-disable-next-line */ }, [date, habitIds.join(",")]);

    async function addHabit() {
        const title = newHabit.trim();
        if (!title) return;

        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;

        const { error } = await supabase.from("habits").insert({ user_id: user.id, title });
        if (error) return alert(error.message);

        setNewHabit("");
        await loadHabits();
    }

    async function toggleHabit(habitId: string, next: boolean) {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;

        setChecks(prev => ({ ...prev, [habitId]: next }));

        const { error } = await supabase.from("habit_checks").upsert({
            user_id: user.id,
            habit_id: habitId,
            check_date: date,
            done: next,
        }, { onConflict: "habit_id,check_date" });

        if (error) return alert(error.message);
    }

    async function deleteHabit(id: string) {
        if (!confirm("Supprimer cette habitude ?")) return;
        const { error } = await supabase.from("habits").delete().eq("id", id);
        if (error) return alert(error.message);
        await loadHabits();
        await loadChecks();
    }

    return (
        <div className="gridGap">
            <Card>
                <div className="row">
                    <div>
                        <h2 className="pageTitle">Aujourd’hui</h2>
                        <p className="pageSub">Habitudes vides au départ — ajoute les tiennes, puis coche par date.</p>
                    </div>
                    <label className="field" style={{ minWidth: 220 }}>
                        <span className="label">Date</span>
                        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>
                </div>
            </Card>

            <Card>
                <div className="row" style={{ alignItems: "end" }}>
                    <Input label="Ajouter une habitude" value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="Ex: Bible / 0 snack / eau uniquement..." />
                    <Button variant="primary" onClick={addHabit} disabled={!newHabit.trim()}>Ajouter</Button>
                </div>

                <div style={{ height: 10 }} />

                {habits.length === 0 ? (
                    <div className="pageSub">Aucune habitude. Ajoute-en 2–4 max, simple.</div>
                ) : (
                    <div className="list">
                        {habits.map(h => (
                            <div key={h.id} className="item">
                                <div>
                                    <div className="itemTitle">{h.title}</div>
                                    <div className="itemSub">Coche pour la date sélectionnée</div>
                                </div>

                                <div className="actions">
                                    <label className="pageSub" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <input
                                            className="checkbox"
                                            type="checkbox"
                                            checked={!!checks[h.id]}
                                            onChange={(e) => toggleHabit(h.id, e.target.checked)}
                                        />
                                        Fait
                                    </label>
                                    <Button variant="danger" onClick={() => deleteHabit(h.id)}>Suppr</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}