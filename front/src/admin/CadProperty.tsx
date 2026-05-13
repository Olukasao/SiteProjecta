import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home,
    Building2,
    MapPin,
    Bed,
    Bath,
    Ruler,
    Eye,
    Save,
    Upload,
    Car
} from "lucide-react";
import "./styles/CadProperty.css";
import { api } from "../services/api";

export default function CadProperty() {
    const navigate = useNavigate();
    const [arquivos, setArquivos] = useState<File[]>([]);
    const [imagens, setImagens] = useState<string[]>([]);

    const [form, setForm] = useState({
        nome: "",
        tipo: "casa",
        status: "venda",
        preco: "",
        precoCondominio: "",
        precoIptu: "",
        endereco: {
            cep: "", rua: "", numero: "", complemento: "",
            bairro: "", cidade: "", estado: ""
        },
        detalhes: {
            quartos: "", suites: "", banheiros: "",
            vagas: "", area: "", cozinha: ""
        },
        diferenciais: [] as string[],
        descricao: ""
    });

    const toggleDiferencial = (item: string) => {
        setForm((prev) => {
            const atuais = prev.diferenciais ?? [];
            const exists = atuais.includes(item);
            return {
                ...prev,
                diferenciais: exists
                    ? atuais.filter((i) => i !== item)
                    : [...atuais, item]
            };
        });
    };

    const listaDiferenciais = [
        "Piscina", "Churrasqueira", "Academia", "Portaria 24h",
        "Elevador", "Mobiliado", "Pet friendly", "Salão de festas"
    ];

    // ========================= HANDLES =========================
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleEndereco = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            endereco: { ...prev.endereco, [name]: value }
        }));
        if (name === "cep" && value.replace(/\D/g, "").length === 8) {
            buscarCEP(value);
        }
    };

    const handleDetalhes = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, detalhes: { ...form.detalhes, [name]: value } });
    };

    const formatarPreco = (valor: string) =>
        valor
            .replace(/\D/g, "")
            .replace(/(\d)(\d{2})$/, "$1,$2")
            .replace(/(?=(\d{3})+(\D))\B/g, ".");

    const formatarPrecoParaBanco = (valor: string) => {
        if (!valor) return 0;
        return Number(valor.replace(/\./g, "").replace(",", "."));
    };

    const handlePreco = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, preco: formatarPreco(e.target.value) });
    };

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setArquivos(prev => [...prev, ...files]);
        const preview = files.map(file => URL.createObjectURL(file));
        setImagens(prev => [...prev, ...preview]);
    };

    const removerImagem = (index: number) => {
        setImagens((prev) => prev.filter((_, i) => i !== index));
        setArquivos((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePreview = () => {
        navigate("/preview-imovel", { state: { ...form, imagens } });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nome", form.nome);
        formData.append("preco", formatarPrecoParaBanco(form.preco).toString());
        formData.append("descricao", form.descricao);
        formData.append("tipo", form.tipo);
        formData.append("status", form.status);
        formData.append("endereco", JSON.stringify(form.endereco));
        formData.append("detalhes", JSON.stringify(form.detalhes));
        formData.append("precoCondominio", formatarPrecoParaBanco(form.precoCondominio).toString());
        formData.append("precoIptu", formatarPrecoParaBanco(form.precoIptu).toString());
        formData.append("diferenciais", JSON.stringify(form.diferenciais));
        arquivos.forEach((file) => formData.append("imagens", file));

        try {
            const res = await api.post("/imoveis", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log(res.data);
            alert("✅ Imóvel cadastrado com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao cadastrar imóvel");
        }
    };

    const buscarCEP = async (cep: string) => {
        const cepLimpo = cep.replace(/\D/g, "");
        if (cepLimpo.length !== 8) return;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();
            if (data.erro) { alert("CEP não encontrado"); return; }
            setForm((prev) => ({
                ...prev,
                endereco: {
                    ...prev.endereco,
                    rua: data.logradouro || "",
                    bairro: data.bairro || "",
                    cidade: data.localidade || "",
                    estado: data.uf || ""
                }
            }));
        } catch (err) {
            console.error("Erro ao buscar CEP:", err);
        }
    };

    const formatarCEP = (valor: string) =>
        valor.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);

    useEffect(() => {
        return () => { imagens.forEach((img) => URL.revokeObjectURL(img)); };
    }, [imagens]);

    const primeiraImagem =
        imagens[0] || "https://via.placeholder.com/1200x500/4f46e5/ffffff?text=Adicione+imagens";

    return (
        <form className="cadastro-container-vertical" onSubmit={handleSubmit}>

            {/* ====== PREVIEW CARD ====== */}
            <div className="box preview-top">
                <div className="preview-main-img">
                    <img src={primeiraImagem} alt={form.nome || "Preview do imóvel"} />
                </div>

                <div className="preview-content">
                    <div className="preview-tags">
                        <span>
                            <Home size={11} />
                            {form.tipo}
                        </span>
                        <span>
                            <Building2 size={11} />
                            {form.status}
                        </span>
                    </div>

                    <h3>{form.nome || "Nome do imóvel"}</h3>

                    <p className="preview-location">
                        <MapPin size={14} />
                        {form.endereco.bairro || "Bairro"} — {form.endereco.cidade || "Cidade"}
                    </p>

                    <span className="preview-preco">
                        R$ {form.preco || "0,00"}
                    </span>

                    {form.precoCondominio && (
                        <p className="preview-extra">Condomínio: R$ {form.precoCondominio}/mês</p>
                    )}
                    {form.precoIptu && (
                        <p className="preview-extra">IPTU: R$ {form.precoIptu}/ano</p>
                    )}

                    <div className="preview-detalhes">
                        <div><Bed size={13} /> {form.detalhes.quartos || 0} quartos</div>
                        <div><Bath size={13} /> {form.detalhes.suites || 0} suítes</div>
                        <div><Bath size={13} /> {form.detalhes.banheiros || 0} banheiros</div>
                        {form.detalhes.vagas && (
                            <div><Car size={13} /> {form.detalhes.vagas} vagas</div>
                        )}
                        {form.detalhes.area && (
                            <div><Ruler size={13} /> {form.detalhes.area} m²</div>
                        )}
                    </div>

                    {form.descricao && (
                        <p className="preview-desc">{form.descricao}</p>
                    )}
                </div>
            </div>

            {/* ====== FORM ====== */}
            <div className="box">
                <h2>
                    <Home size={22} style={{ color: "var(--accent)" }} />
                    Cadastrar Imóvel
                </h2>

                {/* Tipo & Finalidade */}
                <div className="form-type-row">
                    <div className="input-group">
                        <label htmlFor="tipo">Tipo do imóvel</label>
                        <select id="tipo" name="tipo" onChange={handleChange} value={form.tipo}>
                            <option value="casa">Casa</option>
                            <option value="apartamento">Apartamento</option>
                            <option value="terreno">Terreno</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="status">Finalidade</label>
                        <select id="status" name="status" onChange={handleChange} value={form.status}>
                            <option value="venda">Venda</option>
                            <option value="aluguel">Aluguel</option>
                        </select>
                    </div>
                </div>

                {/* Nome */}
                <div className="input-group">
                    <label htmlFor="nome">Nome do imóvel</label>
                    <input
                        id="nome"
                        name="nome"
                        placeholder="Ex: Casa moderna com piscina no centro"
                        onChange={handleChange}
                        value={form.nome}
                    />
                </div>

                {/* Preços */}
                <h3><span>💰</span> Valores</h3>
                <div className="grid-3">
                    <div className="input-group">
                        <label>Preço principal</label>
                        <input
                            name="preco"
                            placeholder="R$ 0,00"
                            value={form.preco}
                            onChange={handlePreco}
                        />
                    </div>
                    <div className="input-group">
                        <label>Condomínio</label>
                        <input
                            name="precoCondominio"
                            placeholder="R$ 0,00 / mês"
                            value={form.precoCondominio}
                            onChange={(e) =>
                                setForm({ ...form, precoCondominio: formatarPreco(e.target.value) })
                            }
                        />
                    </div>
                    <div className="input-group">
                        <label>IPTU</label>
                        <input
                            name="precoIptu"
                            placeholder="R$ 0,00 / ano"
                            value={form.precoIptu}
                            onChange={(e) =>
                                setForm({ ...form, precoIptu: formatarPreco(e.target.value) })
                            }
                        />
                    </div>
                </div>

                {/* Endereço */}
                <h3>
                    <MapPin size={14} />
                    Endereço
                </h3>

                <div className="form-section">
                    <div className="grid-3">
                        <div className="input-group">
                            <label>CEP</label>
                            <input
                                name="cep"
                                placeholder="00000-000"
                                value={form.endereco.cep}
                                onChange={(e) => {
                                    const valor = formatarCEP(e.target.value);
                                    handleEndereco({
                                        ...e,
                                        target: { ...e.target, name: "cep", value: valor }
                                    } as React.ChangeEvent<HTMLInputElement>);
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label>Rua / Logradouro</label>
                            <input
                                name="rua"
                                placeholder="Rua das Flores"
                                onChange={handleEndereco}
                                value={form.endereco.rua}
                            />
                        </div>
                        <div className="input-group">
                            <label>Número</label>
                            <input
                                name="numero"
                                placeholder="123"
                                onChange={handleEndereco}
                                value={form.endereco.numero}
                            />
                        </div>
                    </div>

                    <div className="grid-3">
                        <div className="input-group">
                            <label>Complemento</label>
                            <input
                                name="complemento"
                                placeholder="Apto, Bloco..."
                                onChange={handleEndereco}
                                value={form.endereco.complemento}
                            />
                        </div>
                        <div className="input-group">
                            <label>Bairro</label>
                            <input
                                name="bairro"
                                placeholder="Centro"
                                onChange={handleEndereco}
                                value={form.endereco.bairro}
                            />
                        </div>
                        <div className="input-group">
                            <label>Cidade</label>
                            <input
                                name="cidade"
                                placeholder="São Paulo"
                                onChange={handleEndereco}
                                value={form.endereco.cidade}
                            />
                        </div>
                        <div className="input-group">
                            <label>Estado</label>
                            <input
                                name="estado"
                                placeholder="SP"
                                onChange={handleEndereco}
                                value={form.endereco.estado}
                            />
                        </div>
                    </div>
                </div>

                {/* Detalhes */}
                <h3>
                    <Ruler size={14} />
                    Detalhes do imóvel
                </h3>

                <div className="grid-4">
                    <div className="input-group">
                        <label>Dormitórios</label>
                        <input
                            name="quartos"
                            placeholder="0"
                            onChange={handleDetalhes}
                            value={form.detalhes.quartos}
                        />
                    </div>
                    <div className="input-group">
                        <label>Suítes</label>
                        <input
                            type="number"
                            name="suites"
                            placeholder="0"
                            min="0"
                            onChange={handleDetalhes}
                            value={form.detalhes.suites}
                        />
                    </div>
                    <div className="input-group">
                        <label>Banheiros</label>
                        <input
                            name="banheiros"
                            placeholder="0"
                            onChange={handleDetalhes}
                            value={form.detalhes.banheiros}
                        />
                    </div>
                    <div className="input-group">
                        <label>Vagas de garagem</label>
                        <input
                            name="vagas"
                            placeholder="0"
                            onChange={handleDetalhes}
                            value={form.detalhes.vagas}
                        />
                    </div>
                    <div className="input-group">
                        <label>Área total (m²)</label>
                        <input
                            name="area"
                            placeholder="Ex: 120"
                            onChange={handleDetalhes}
                            value={form.detalhes.area}
                        />
                    </div>
                    <div className="input-group">
                        <label>Cozinha</label>
                        <input
                            name="cozinha"
                            placeholder="Americana, Integrada..."
                            onChange={handleDetalhes}
                            value={form.detalhes.cozinha}
                        />
                    </div>
                </div>

                {/* Diferenciais */}
                <h3><span>✨</span> Diferenciais</h3>
                <div className="diferenciais-grid">
                    {listaDiferenciais.map((item) => (
                        <label key={item} className="checkbox-card">
                            <input
                                type="checkbox"
                                checked={form.diferenciais.includes(item)}
                                onChange={() => toggleDiferencial(item)}
                            />
                            <span>{item}</span>
                        </label>
                    ))}
                </div>

                {/* Descrição */}
                <h3><span>📝</span> Descrição</h3>
                <div className="input-group">
                    <textarea
                        name="descricao"
                        placeholder="Descreva os pontos fortes do imóvel, localização, acabamentos..."
                        onChange={handleChange}
                        value={form.descricao}
                    />
                </div>

                {/* Imagens */}
                <h3><span>🖼️</span> Imagens</h3>
                <div className="input-group">
                    <label className="upload-label" htmlFor="file-upload">
                        <Upload size={16} />
                        <span>Clique para selecionar imagens</span>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImage}
                            style={{ display: "none" }}
                        />
                    </label>

                    {imagens.length > 0 && (
                        <div className="preview-imagens">
                            {imagens.map((img, index) => (
                                <div key={index} className="img-box">
                                    <img src={img} alt={`imagem-${index}`} />
                                    <button
                                        type="button"
                                        className="btn-remove-img"
                                        onClick={() => removerImagem(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="actions">
                    <button type="button" className="btn-secondary" onClick={handlePreview}>
                        <Eye size={15} />
                        Ver modo cliente
                    </button>
                    <button type="submit" className="btn-primary">
                        <Save size={15} />
                        Salvar imóvel
                    </button>
                </div>
            </div>
        </form>
    );
}