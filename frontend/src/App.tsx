import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import TodayPage from "./pages/TodayPage";
import MonthPage from "./pages/MonthPage";
import PlanningPage from "./pages/PlanningPage";

import Button from "./components/Button";
import Card from "./components/Card";

type Tab = "dashboard" | "today" | "month" | "planning";

export default function App() {
    const [tab, setTab] = useState<Tab>("dashboard");
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
        return () => sub.subscription.unsubscribe();
    }, []);

    if (!session) return <AuthPage />;

    return (
        <div className="container">
            <div className="gridGap">
                <Card>
                    <div className="row">
                        <div>
                            <h1 className="pageTitle">Objectifs</h1>
                            <p className="pageSub">UI dark clean — ajoute tout depuis l’interface.</p>
                        </div>

                        <div className="tabs">
                            <button className={`tab ${tab === "dashboard" ? "tabActive" : ""}`} onClick={() => setTab("dashboard")}>Dashboard</button>
                            <button className={`tab ${tab === "today" ? "tabActive" : ""}`} onClick={() => setTab("today")}>Aujourd’hui</button>
                            <button className={`tab ${tab === "month" ? "tabActive" : ""}`} onClick={() => setTab("month")}>Mois</button>
                            <button className={`tab ${tab === "planning" ? "tabActive" : ""}`} onClick={() => setTab("planning")}>Planning</button>
                            <Button variant="danger" onClick={() => supabase.auth.signOut()}>Logout</Button>
                        </div>
                    </div>
                </Card>

                {tab === "dashboard" ? <DashboardPage /> : null}
                {tab === "today" ? <TodayPage /> : null}
                {tab === "month" ? <MonthPage /> : null}
                {tab === "planning" ? <PlanningPage /> : null}
            </div>
        </div>
    );
}