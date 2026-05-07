import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Upload,
    Save,
    ImageIcon,
    MapPin,
    Ruler,
    Tag,
    Sparkles,
    Home,
} from "lucide-react";
import { api } from "../services/api";
import "./styles/EditImovel.css";

interface FormState {
    titulo: string;
    preco: string;
    descricao: string;
    quartos: string;
    suites: string;
    banheiros: string;
    vagas: string;
    area: string;
    cidade: string;
    bairro: string;
    endereco: string;
    cep: string;
    tipo: string;
    precoCondominio: string;
    precoIptu: string;
    diferenciais: string[];
    imagens: string[];
}

interface FilePreview {
    file: File;
    url: string;
}

export default function EditImovel() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [files, setFiles] = useState<FilePreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedImg, setSelectedImg] = useState<string>("");

    const [form, setForm] = useState<FormState>({
        titulo: "",
        preco: "",
        descricao: "",
        quartos: "",
        suites: "",
        banheiros: "",
        vagas: "",
        area: "",
        cidade: "",
        bairro: "",
        endereco: "",
        cep: "",
        tipo: "",
        precoCondominio: "",
        precoIptu: "",
        diferenciais: [],
        imagens: [],
    });

    // ========================= LOAD =========================
    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/imovel/${id}`);
                const data = res.data;

                const imagens: string[] = Array.isArray(data.imagens)
                    ? data.imagens
                    : (data.imagens?.split(",") || []);

                setForm({
                    titulo: data.titulo || "",
                    preco: data.preco || "",
                    descricao: data.descricao || "",
                    quartos: data.quartos || "",
                    suites: data.suites || "",
                    banheiros: data.banheiros || "",
                    vagas: data.vagas || "",
                    area: data.area || "",
                    cidade: data.cidade || "",
                    bairro: data.bairro || "",
                    endereco: data.endereco || "",
                    cep: data.cep || "",
                    tipo: data.tipo || "",
                    precoCondominio: data.preco_condominio || "",
                    precoIptu: data.preco_iptu || "",
                    diferenciais: data.diferenciais || [],
                    imagens,
                });

                setSelectedImg(imagens[0] || "");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    // ========================= HANDLES =========================
    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = Array.from(e.target.files || []) as File[];
        const previews: FilePreview[] = selected.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setFiles((prev) => [...prev, ...previews]);
    }

    function removeExistingImage(index: number) {
        setForm((prev) => {
            const imgs = prev.imagens.filter((_, i) => i !== index);
            if (selectedImg === prev.imagens[index]) {
                setSelectedImg(imgs[0] || "");
            }
            return { ...prev, imagens: imgs };
        });
    }

    function removeNewImage(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }

    // ========================= SUBMIT =========================
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();

            formData.append("nome", form.titulo);
            formData.append("preco", form.preco);
            formData.append("descricao", form.descricao);
            formData.append("tipo", form.tipo);
            formData.append("precoCondominio", form.precoCondominio);
            formData.append("precoIptu", form.precoIptu);
            formData.append("diferenciais", JSON.stringify(form.diferenciais));
            formData.append("endereco", JSON.stringify({
                cidade: form.cidade,
                bairro: form.bairro,
                cep: form.cep,
                rua: form.endereco,
            }));
            formData.append("detalhes", JSON.stringify({
                quartos: form.quartos,
                suites: form.suites,
                banheiros: form.banheiros,
                vagas: form.vagas,
                area: form.area,
            }));
            formData.append("imagensAntigas", JSON.stringify(form.imagens));
            files.forEach(({ file }) => formData.append("imagens", file));

            await api.put(`/imoveis/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Imóvel atualizado com sucesso!");
            navigate("/admin/imoveis");
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar imóvel");
        } finally {
            setSaving(false);
        }
    }

    // ========================= LOADING STATE =========================
    if (loading) {
        return (
            <div className="loading-state">
                <span>Carregando imóvel...</span>
            </div>
        );
    }

    const allImages = [
        ...form.imagens.map((url) => ({ url, isNew: false })),
        ...files.map(({ url }) => ({ url, isNew: true })),
    ];

    return (
        <div className="edit-container">

            {/* ====== HEADER ====== */}
            <div className="edit-header">
                <h1>Editar Imóvel</h1>
                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate("/admin/imoveis")}
                >
                    <ArrowLeft size={14} />
                    Voltar
                </button>
            </div>

            <form className="edit-form" onSubmit={handleSubmit}>

                {/* ====== GALLERY ====== */}
                <div className="gallery-section">
                    <div className="main-photo">
                        {selectedImg ? (
                            <img src={selectedImg} alt="Foto principal" />
                        ) : (
                            <div className="main-photo-empty">
                                <ImageIcon size={36} />
                                <span>Nenhuma imagem selecionada</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ====== IMAGES MANAGER ====== */}
                <div className="form-section-edit">
                    <p className="section-title">
                        <ImageIcon size={13} />
                        Gerenciar imagens
                    </p>

                    {allImages.length > 0 && (
                        <div className="images-grid">
                            {form.imagens.map((img, index) => (
                                <div
                                    key={`existing-${index}`}
                                    className={`image-card ${selectedImg === img ? "is-selected" : ""}`}
                                    onClick={() => setSelectedImg(img)}
                                >
                                    <img src={img} className="mini-img" alt={`imagem-${index}`} />
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={(e) => { e.stopPropagation(); removeExistingImage(index); }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            {files.map((f, index) => (
                                <div key={`new-${index}`} className="image-card">
                                    <img src={f.url} className="mini-img" alt={`nova-${index}`} />
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removeNewImage(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label className="upload-label" htmlFor="file-upload" style={{ marginTop: allImages.length > 0 ? "1rem" : "0" }}>
                        <Upload size={15} />
                        <span>Adicionar novas imagens</span>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </label>
                </div>

                {/* ====== INFORMAÇÕES BÁSICAS ====== */}
                <div className="form-section-edit">
                    <p className="section-title">
                        <Home size={13} />
                        Informações básicas
                    </p>

                    <div className="grid-field-group">
                        <div className="input-group">
                            <label htmlFor="titulo">Título do imóvel</label>
                            <input
                                id="titulo"
                                name="titulo"
                                value={form.titulo}
                                onChange={handleChange}
                                placeholder="Ex: Apartamento moderno com vista para o mar"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="tipo">Tipo</label>
                            <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
                                <option value="">Selecionar tipo</option>
                                <option value="casa">Casa</option>
                                <option value="apartamento">Apartamento</option>
                                <option value="terreno">Terreno</option>
                                <option value="comercial">Comercial</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="descricao">Descrição</label>
                            <textarea
                                id="descricao"
                                name="descricao"
                                value={form.descricao}
                                onChange={handleChange}
                                placeholder="Descreva os pontos fortes do imóvel, acabamentos, localização..."
                            />
                        </div>
                    </div>
                </div>

                {/* ====== VALORES ====== */}
                <div className="form-section-edit">
                    <p className="section-title">
                        <Tag size={13} />
                        Valores
                    </p>

                    <div className="grid-3">
                        <div className="input-group">
                            <label htmlFor="preco">Preço principal</label>
                            <input
                                id="preco"
                                name="preco"
                                value={form.preco}
                                onChange={handleChange}
                                placeholder="R$ 0,00"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="precoCondominio">Condomínio</label>
                            <input
                                id="precoCondominio"
                                name="precoCondominio"
                                value={form.precoCondominio}
                                onChange={handleChange}
                                placeholder="R$ 0,00 / mês"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="precoIptu">IPTU</label>
                            <input
                                id="precoIptu"
                                name="precoIptu"
                                value={form.precoIptu}
                                onChange={handleChange}
                                placeholder="R$ 0,00 / ano"
                            />
                        </div>
                    </div>
                </div>

                {/* ====== DETALHES ====== */}
                <div className="form-section-edit">
                    <p className="section-title">
                        <Ruler size={13} />
                        Detalhes do imóvel
                    </p>

                    <div className="grid-3">
                        <div className="input-group">
                            <label htmlFor="quartos">Dormitórios</label>
                            <input
                                id="quartos"
                                name="quartos"
                                value={form.quartos}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="suites">Suítes</label>
                            <input
                                id="suites"
                                name="suites"
                                value={form.suites}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="banheiros">Banheiros</label>
                            <input
                                id="banheiros"
                                name="banheiros"
                                value={form.banheiros}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="vagas">Vagas de garagem</label>
                            <input
                                id="vagas"
                                name="vagas"
                                value={form.vagas}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="area">Área (m²)</label>
                            <input
                                id="area"
                                name="area"
                                value={form.area}
                                onChange={handleChange}
                                placeholder="Ex: 120"
                            />
                        </div>
                    </div>
                </div>

                {/* ====== ENDEREÇO ====== */}
                <div className="form-section-edit">
                    <p className="section-title">
                        <MapPin size={13} />
                        Endereço
                    </p>

                    <div className="grid-field-group">
                        <div className="grid-3">
                            <div className="input-group">
                                <label htmlFor="cep">CEP</label>
                                <input
                                    id="cep"
                                    name="cep"
                                    value={form.cep}
                                    onChange={handleChange}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="input-group" style={{ gridColumn: "span 2" }}>
                                <label htmlFor="endereco">Rua / Logradouro</label>
                                <input
                                    id="endereco"
                                    name="endereco"
                                    value={form.endereco}
                                    onChange={handleChange}
                                    placeholder="Rua das Flores, 123"
                                />
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="input-group">
                                <label htmlFor="bairro">Bairro</label>
                                <input
                                    id="bairro"
                                    name="bairro"
                                    value={form.bairro}
                                    onChange={handleChange}
                                    placeholder="Centro"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="cidade">Cidade</label>
                                <input
                                    id="cidade"
                                    name="cidade"
                                    value={form.cidade}
                                    onChange={handleChange}
                                    placeholder="São Paulo"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ====== DIFERENCIAIS ====== */}
                <div className="form-section-edit">
                    <p className="section-title">
                        <Sparkles size={13} />
                        Diferenciais
                    </p>

                    <div className="input-group">
                        <label htmlFor="diferenciais">Diferenciais</label>
                        <input
                            id="diferenciais"
                            type="text"
                            placeholder="Piscina, Churrasqueira, Academia..."
                            value={form.diferenciais?.join(", ") || ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    diferenciais: e.target.value.split(",").map((i) => i.trim()).filter(Boolean),
                                }))
                            }
                        />
                        <p className="diferenciais-hint">Separe cada diferencial por vírgula</p>
                    </div>
                </div>

                {/* ====== ACTIONS ====== */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate("/admin/imoveis")}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        <Save size={15} />
                        {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>

            </form>
        </div>
    );
}