import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type {Goal, GoalType} from "../lib/types";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Progress from "../components/Progress";

function pct(current: number, target: number | null) {
    if (!target || target <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

export default function DashboardPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const [openAdd, setOpenAdd] = useState(false);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Autre");
    const [type, setType] = useState<GoalType>("number");
    const [unit, setUnit] = useState("");
    const [target, setTarget] = useState<number | "">("");
    const [current, setCurrent] = useState<number | "">("");

    const grouped = useMemo(() => {
        const map = new Map<string, Goal[]>();
        for (const g of goals) {
            const key = g.category || "Autre";
            map.set(key, [...(map.get(key) ?? []), g]);
        }
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [goals]);

    async function load() {
        setLoading(true);
        const { data, error } = await supabase
            .from("goals")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) alert(error.message);
        setGoals((data ?? []) as Goal[]);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function addGoal() {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;

        const payload: any = {
            user_id: user.id,
            title: title.trim(),
            category: category.trim() || "Autre",
            type,
            is_active: true,
        };

        if (type === "checkbox") {
            payload.current_value = 0;
            payload.target_value = 1;
            payload.unit = null;
        } else if (type === "weight") {
            payload.unit = "kg";
            payload.current_value = typeof current === "number" ? current : 0;
            payload.target_value = typeof target === "number" ? target : null;
        } else {
            payload.unit = unit.trim() || null;
            payload.current_value = typeof current === "number" ? current : 0;
            payload.target_value = typeof target === "number" ? target : null;
        }

        const { error } = await supabase.from("goals").insert(payload);
        if (error) return alert(error.message);

        setOpenAdd(false);
        setTitle(""); setCategory("Autre"); setType("number"); setUnit(""); setTarget(""); setCurrent("");
        await load();
    }

    async function deleteGoal(id: string) {
        if (!confirm("Supprimer cet objectif ?")) return;
        const { error } = await supabase.from("goals").delete().eq("id", id);
        if (error) return alert(error.message);
        await load();
    }

    async function addProgress(goal: Goal) {
        if (goal.type === "checkbox") {
            const next = goal.current_value >= 1 ? 0 : 1;
            const { error } = await supabase.from("goals").update({ current_value: next }).eq("id", goal.id);
            if (error) return alert(error.message);
            await load();
            return;
        }

        const raw = prompt(goal.type === "weight" ? "Nouveau poids (kg) ?" : "Ajouter combien ? (ex: 10)");
        if (!raw) return;

        const n = Number(raw);
        if (!Number.isFinite(n)) return alert("Nombre invalide");

        if (goal.type === "weight") {
            const { error: e1 } = await supabase.from("goals").update({ current_value: n }).eq("id", goal.id);
            if (e1) return alert(e1.message);

            const { data: auth } = await supabase.auth.getUser();
            const user = auth.user;
            if (user) {
                await supabase.from("goal_entries").insert({ user_id: user.id, goal_id: goal.id, value: n });
            }
            await load();
            return;
        }

        const next = Math.max(0, goal.current_value + n);
        const { error: e1 } = await supabase.from("goals").update({ current_value: next }).eq("id", goal.id);
        if (e1) return alert(e1.message);

        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (user) {
            await supabase.from("goal_entries").insert({ user_id: user.id, goal_id: goal.id, delta: n });
        }
        await load();
    }

    return (
        <div className="gridGap">
            <Card>
                <div className="row">
                    <div>
                        <h2 className="pageTitle">Dashboard</h2>
                        <p className="pageSub">Objectifs vides au départ — tu ajoutes tout via “Ajouter”.</p>
                    </div>
                    <Button variant="primary" onClick={() => setOpenAdd(true)}>+ Ajouter un objectif</Button>
                </div>
            </Card>

            {loading ? (
                <Card>Chargement...</Card>
            ) : goals.length === 0 ? (
                <Card>
                    <div className="pageSub">Aucun objectif. Ajoute 2–3 objectifs simples pour commencer.</div>
                </Card>
            ) : (
                <div className="gridGap">
                    {grouped.map(([cat, items]) => (
                        <Card key={cat}>
                            <div className="row" style={{ marginBottom: 10 }}>
                                <div className="itemTitle">{cat}</div>
                                <div className="pageSub">{items.length} objectif(s)</div>
                            </div>

                            <div className="list" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" as any }}>
                                {items.map(g => {
                                    const p = g.type === "checkbox" ? (g.current_value >= 1 ? 100 : 0) : pct(g.current_value, g.target_value);
                                    const meta =
                                        g.type === "checkbox"
                                            ? (g.current_value >= 1 ? "✅ Terminé" : "⏳ Pas encore")
                                            : g.type === "weight"
                                                ? `${g.current_value} / ${g.target_value ?? "?"} kg`
                                                : `${g.current_value} / ${g.target_value ?? "?"} ${g.unit ?? ""}`;

                                    return (
                                        <div key={g.id} className="item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                                            <div className="row" style={{ justifyContent: "space-between" }}>
                                                <div>
                                                    <div className="itemTitle">{g.title}</div>
                                                    <div className="itemSub">{meta}</div>
                                                </div>
                                                <div className="actions">
                                                    <Button onClick={() => addProgress(g)}>{g.type === "checkbox" ? "Toggle" : "+ Progress"}</Button>
                                                    <Button variant="danger" onClick={() => deleteGoal(g.id)}>Suppr</Button>
                                                </div>
                                            </div>
                                            <Progress value={p} />
                                            <div className="itemSub">{p}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={openAdd} title="Ajouter un objectif" onClose={() => setOpenAdd(false)}>
                <div className="gridGap">
                    <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Lire 1200 pages" />
                    <Input label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Spiritualité / Sport / ..." />

                    <label className="field">
                        <span className="label">Type</span>
                        <select className="select" value={type} onChange={(e) => setType(e.target.value as GoalType)}>
                            <option value="number">Chiffré (pages/km/sessions)</option>
                            <option value="checkbox">Oui/Non (0/1)</option>
                            <option value="weight">Poids (kg)</option>
                        </select>
                    </label>

                    {type === "number" ? (
                        <div className="gridGap" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" as any }}>
                            <Input label="Unité" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pages" />
                            <Input label="Actuel" type="number" value={current} onChange={(e) => setCurrent(e.target.value === "" ? "" : Number(e.target.value))} />
                            <Input label="Objectif" type="number" value={target} onChange={(e) => setTarget(e.target.value === "" ? "" : Number(e.target.value))} />
                        </div>
                    ) : null}

                    {type === "weight" ? (
                        <div className="gridGap" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" as any }}>
                            <Input label="Poids actuel (kg)" type="number" value={current} onChange={(e) => setCurrent(e.target.value === "" ? "" : Number(e.target.value))} />
                            <Input label="Objectif (kg)" type="number" value={target} onChange={(e) => setTarget(e.target.value === "" ? "" : Number(e.target.value))} />
                        </div>
                    ) : null}

                    <Button variant="primary" onClick={addGoal} disabled={!title.trim() || !category.trim()}>
                        Ajouter
                    </Button>
                </div>
            </Modal>
        </div>
    );
}