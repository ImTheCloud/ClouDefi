import { useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit() {
        setMsg(null);
        setLoading(true);
        try {
            if (mode === "register") {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMsg("Compte créé ✅ Tu peux te connecter.");
                setMode("login");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (e: any) {
            setMsg(e?.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="gridGap" style={{ maxWidth: 520 }}>
                <div>
                    <h1 className="pageTitle">Objectifs</h1>
                    <p className="pageSub">Login email + mot de passe. Données privées via Supabase.</p>
                </div>

                <Card>
                    <div className="row" style={{ marginBottom: 10 }}>
                        <Button variant={mode === "login" ? "primary" : "ghost"} onClick={() => setMode("login")} className="tab">
                            Login
                        </Button>
                        <Button variant={mode === "register" ? "primary" : "ghost"} onClick={() => setMode("register")} className="tab">
                            Register
                        </Button>
                    </div>

                    <div className="gridGap">
                        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@mail.com" />
                        <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

                        {msg ? <div className="pageSub">{msg}</div> : null}

                        <Button
                            variant="primary"
                            onClick={submit}
                            disabled={loading || !email || password.length < 6}
                        >
                            {loading ? "..." : mode === "register" ? "Créer le compte" : "Se connecter"}
                        </Button>

                        <div className="pageSub">Mot de passe : 6 caractères minimum.</div>
                    </div>
                </Card>
            </div>
        </div>
    );
}