import { useState } from "react";
import { api } from "../services/api";
import { getPasswordError } from "./utils/password";
import "./styles/cadUser.css";

type Errors = {
    senhaAtual?: string;
    novaSenha?: string;
    confirmarSenha?: string;
};

export default function ChangeOwnPassword() {
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    function validate() {
        const nextErrors: Errors = {};

        if (!senhaAtual) nextErrors.senhaAtual = "Informe sua senha atual";
        if (!novaSenha) {
            nextErrors.novaSenha = "Informe a nova senha";
        } else {
            const passwordError = getPasswordError(novaSenha, "A nova senha");
            if (passwordError) nextErrors.novaSenha = passwordError;
        }

        if (!confirmarSenha) {
            nextErrors.confirmarSenha = "Confirme a nova senha";
        } else if (novaSenha !== confirmarSenha) {
            nextErrors.confirmarSenha = "Senhas não conferem";
        }

        if (senhaAtual && novaSenha && senhaAtual === novaSenha) {
            nextErrors.novaSenha = "A nova senha deve ser diferente da senha atual";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validate()) return;

        try {
            setSaving(true);
            await api.put("/me/password", { senhaAtual, novaSenha });
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
            setSuccess("Senha alterada com sucesso.");
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.response?.data?.error || "Não foi possível alterar a senha.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="cad-container">
            <h2>Minha senha</h2>

            {error && <div className="cad-error">{error}</div>}
            {success && <div className="cad-success">{success}</div>}

            <form onSubmit={handleSubmit} className="cad-form">
                <div className="cad-field">
                    <label>Senha atual</label>
                    <input
                        type="password"
                        value={senhaAtual}
                        onChange={(event) => {
                            setSenhaAtual(event.target.value);
                            setErrors((prev) => ({ ...prev, senhaAtual: "" }));
                        }}
                    />
                    {errors.senhaAtual && <span>{errors.senhaAtual}</span>}
                </div>

                <div className="cad-row">
                    <div className="cad-field">
                        <label>Nova senha</label>
                        <input
                            type="password"
                            value={novaSenha}
                            onChange={(event) => {
                                setNovaSenha(event.target.value);
                                setErrors((prev) => ({ ...prev, novaSenha: "" }));
                            }}
                        />
                        {errors.novaSenha && <span>{errors.novaSenha}</span>}
                    </div>

                    <div className="cad-field">
                        <label>Confirmar nova senha</label>
                        <input
                            type="password"
                            value={confirmarSenha}
                            onChange={(event) => {
                                setConfirmarSenha(event.target.value);
                                setErrors((prev) => ({ ...prev, confirmarSenha: "" }));
                            }}
                        />
                        {errors.confirmarSenha && <span>{errors.confirmarSenha}</span>}
                    </div>
                </div>

                <div className="cad-actions">
                    <button type="submit" disabled={saving}>
                        {saving ? "Salvando..." : "Alterar senha"}
                    </button>
                </div>
            </form>
        </div>
    );
}
