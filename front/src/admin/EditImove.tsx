import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./styles/EditImovel.css";

export default function EditImovel() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<any>({
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

    function handleFileChange(e: any) {
        const selected = Array.from(e.target.files);

        const preview = selected.map((file: any) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setFiles((prev) => [...prev, ...preview]);
    }

    function removeNewImage(index: number) {
        setFiles((prev) => prev.filter((_: any, i: number) => i !== index));
    }


    const [selectedImg, setSelectedImg] = useState<string>("");

    // =========================
    // LOAD IMÓVEL
    // =========================
    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/imovel/${id}`);
                const data = res.data;

                const imagens = Array.isArray(data.imagens)
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

    // =========================
    // INPUT CHANGE
    // =========================
    function handleChange(e: any) {
        const { name, value } = e.target;

        setForm((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    }

    // =========================
    // IMAGENS
    // =========================
    function removeImagem(index: number) {
        setForm((prev: any) => {
            const imgs = prev.imagens.filter((_: any, i: number) => i !== index);

            if (selectedImg === prev.imagens[index]) {
                setSelectedImg(imgs[0] || "");
            }

            return { ...prev, imagens: imgs };
        });
    }

    // =========================
    // SUBMIT
    // =========================
    async function handleSubmit(e: any) {
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

            // 🔥 imagens antigas (mantidas)
            formData.append("imagensAntigas", JSON.stringify(form.imagens));

            // 🔥 novas imagens
            files.forEach((file: any) => {
                formData.append("imagens", file.file);
            });

            await api.put(`/imoveis/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
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
    if (loading) return <p>Carregando...</p>;

    return (
        <div className="edit-container">

            <h1>Editar Imóvel</h1>

            <form className="edit-form" onSubmit={handleSubmit}>

                {/* =========================
                    IMAGEM PRINCIPAL
                ========================= */}
                <div className="gallery-container">
                    <div className="main-photo">
                        <img src={selectedImg} alt="principal" />
                    </div>
                </div>

                {/* =========================
                    LISTA DE IMAGENS
                ========================= */}
                <div className="images-editor">
                    <h3>Imagens</h3>

                    <div className="images-grid">
                        {form.imagens?.map((img: string, index: number) => (
                            <div className="image-card" key={index}>
                                <img src={img} className="mini-img" />

                                <button
                                    type="button"
                                    onClick={() => removeImagem(index)}
                                    className="remove-btn"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <h3>Adicionar novas imagens</h3>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {files.length > 0 && (
                    <div className="images-grid">
                        {files.map((img: any, index: number) => (
                            <div key={index} className="image-card">
                                <img src={img.url} className="mini-img" />

                                <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className="remove-btn"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {/* =========================
                    CAMPOS
                ========================= */}
                <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título" />
                <input name="preco" value={form.preco} onChange={handleChange} placeholder="Preço" />
                <div className="grid-2">
                    <input
                        name="precoCondominio"
                        value={form.precoCondominio}
                        onChange={handleChange}
                        placeholder="Condomínio"
                    />

                    <input
                        name="precoIptu"
                        value={form.precoIptu}
                        onChange={handleChange}
                        placeholder="IPTU"
                    />
                </div>

                <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" />

                {/* DETALHES */}
                <div className="grid-2">
                    <input name="quartos" value={form.quartos} onChange={handleChange} placeholder="Quartos" />
                    <input name="suites" value={form.suites} onChange={handleChange} placeholder="Suítes" />
                    <input name="banheiros" value={form.banheiros} onChange={handleChange} placeholder="Banheiros" />
                    <input name="vagas" value={form.vagas} onChange={handleChange} placeholder="Vagas" />
                    <input name="area" value={form.area} onChange={handleChange} placeholder="Área m²" />
                </div>

                {/* ENDEREÇO */}
                <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço" />
                <input name="bairro" value={form.bairro} onChange={handleChange} placeholder="Bairro" />
                <input name="cidade" value={form.cidade} onChange={handleChange} placeholder="Cidade" />
                <input name="cep" value={form.cep} onChange={handleChange} placeholder="CEP" />

                {/* PREÇOS EXTRAS */}


                {/* TIPO */}
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                    <option value="">Tipo</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="comercial">Comercial</option>
                </select>

                {/* DIFERENCIAIS */}
                <input
                    type="text"
                    placeholder="Diferenciais (separados por vírgula)"
                    value={form.diferenciais?.join(", ") || ""}
                    onChange={(e) =>
                        setForm((prev: any) => ({
                            ...prev,
                            diferenciais: e.target.value.split(",").map((i) => i.trim()),
                        }))
                    }
                />

                <button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar alterações"}
                </button>

            </form>
        </div>
    );
}