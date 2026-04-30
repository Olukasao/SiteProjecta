import { useState } from "react";
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
    Upload
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
        precoCondominio: "", // ✅ NOVO
        precoIptu: "",       // ✅ NOVO

        endereco: {
            cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: ""
        },

        detalhes: {
            quartos: "",
            suites: "",
            banheiros: "",
            vagas: "",
            area: "",
            cozinha: ""
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
        "Piscina",
        "Churrasqueira",
        "Academia",
        "Portaria 24h",
        "Elevador",
        "Mobiliado",
        "Pet friendly",
        "Salão de festas"
    ];
    // ========================= HANDLES =========================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        setForm({
            ...form,
            detalhes: { ...form.detalhes, [name]: value }
        });
    };

    const formatarPreco = (valor: string) => {
        return valor
            .replace(/\D/g, "")
            .replace(/(\d)(\d{2})$/, "$1,$2")
            .replace(/(?=(\d{3})+(\D))\B/g, ".");
    };

    const formatarPrecoParaBanco = (valor: string) => {
        if (!valor) return 0;

        return Number(
            valor
                .replace(/\./g, "") // remove pontos (milhar)
                .replace(",", ".")  // vírgula vira ponto
        );
    };
    const handlePreco = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = formatarPreco(e.target.value);
        setForm({ ...form, preco: valor });
    };

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        setArquivos(prev => [...prev, ...files]);

        // preview
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
        arquivos.forEach((file) => {
            formData.append("imagens", file);
        });

        try {
            const res = await api.post("/imoveis", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
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

            if (data.erro) {
                alert("CEP não encontrado");
                return;
            }

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

    const formatarCEP = (valor: string) => {
        return valor
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .slice(0, 9);
    };

    const primeiraImagem = imagens[0] || "https://via.placeholder.com/800x400/6366f1/ffffff?text=Adicione+imagens";

    return (
        <form className="cadastro-container-vertical" onSubmit={handleSubmit}>
            {/* ================= PREVIEW TOPO ================= */}
            <div className="box preview-top">
                <div className="preview-main-img">
                    <img src={primeiraImagem} alt={form.nome || "Preview"} />
                </div>

                <div className="preview-content">
                    <div className="preview-tags">
                        <span>
                            <Home className="w-3 h-3 mr-1 inline" />
                            {form.tipo}
                        </span>
                        <span>
                            <Building2 className="w-3 h-3 mr-1 inline" />
                            {form.status}
                        </span>
                    </div>

                    <h3>{form.nome || "Nome do imóvel"}</h3>

                    <p className="preview-location">
                        <MapPin className="w-4 h-4 mr-2 inline" />
                        {form.endereco.bairro || "-"} - {form.endereco.cidade || "-"}
                    </p>

                    <span className="preview-preco">
                        R$ {form.preco || "0,00"}
                    </span>
                    {form.precoCondominio && (
                        <p className="preview-extra">
                            Cond: R$ {form.precoCondominio}/mês
                        </p>
                    )}

                    {form.precoIptu && (
                        <p className="preview-extra">
                            IPTU: R$ {form.precoIptu}/ano
                        </p>
                    )}
                    <div className="preview-detalhes">
                        <div>
                            <Bed className="w-4 h-4 mr-2 inline" />
                            {form.detalhes.quartos || 0}
                        </div>

                        {/* ✅ SUÍTES */}
                        <div>
                            <Bath className="w-4 h-4 mr-2 inline" />
                            {form.detalhes.suites || 0} suítes
                        </div>

                        <div>
                            <Bath className="w-4 h-4 mr-2 inline" />
                            {form.detalhes.banheiros || 0}
                        </div>
                    </div>
                    <p className="preview-desc">
                        {form.descricao || "Descrição do imóvel..."}
                    </p>
                </div>
            </div>




            {/* ================= FORM ================= */}
            <div className="box">
                <h2>
                    <Home className="w-7 h-7 mr-3 inline text-indigo-500" />
                    Cadastrar Imóvel
                </h2>

                <div className="grid-2">
                    <div className="input-group">
                        <select name="tipo" onChange={handleChange} value={form.tipo}>
                            <option value="casa">
                                <Home className="w-4 h-4 mr-2 inline" />
                                Casa
                            </option>
                            <option value="apartamento">
                                <Building2 className="w-4 h-4 mr-2 inline" />
                                Apartamento
                            </option>
                            <option value="terreno">
                                <MapPin className="w-4 h-4 mr-2 inline" />
                                Terreno
                            </option>
                        </select>
                    </div>

                    <div className="input-group">
                        <select name="status" onChange={handleChange} value={form.status}>
                            <option value="venda">
                                <Save className="w-4 h-4 mr-2 inline" />
                                Venda
                            </option>
                            <option value="aluguel">
                                <Home className="w-4 h-4 mr-2 inline" />
                                Aluguel
                            </option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <input
                        name="nome"
                        placeholder="Nome do imóvel"
                        onChange={handleChange}
                        value={form.nome}
                    />
                </div>

                <div className="input-group">
                    <input
                        name="preco"
                        placeholder="R$ 0,00"
                        value={form.preco}
                        onChange={handlePreco}
                    />
                </div>
                <div className="grid-2">

                    <div className="input-group">
                        <input
                            name="precoCondominio"
                            placeholder="Condomínio (R$)"
                            value={form.precoCondominio}
                            onChange={(e) =>
                                setForm({ ...form, precoCondominio: formatarPreco(e.target.value) })
                            }
                        />
                    </div>

                    <div className="input-group">
                        <input
                            name="precoIptu"
                            placeholder="IPTU (R$)"
                            value={form.precoIptu}
                            onChange={(e) =>
                                setForm({ ...form, precoIptu: formatarPreco(e.target.value) })
                            }
                        />
                    </div>

                </div>

                <h3>
                    <MapPin className="w-5 h-5 mr-2 inline" />
                    Endereço
                </h3>

                <div className="form-section">
                    <div className="grid-3">
                        <div className="input-group">
                            <input
                                name="cep"
                                placeholder="CEP"
                                value={form.endereco.cep}
                                onChange={(e) => {
                                    const valor = formatarCEP(e.target.value);

                                    handleEndereco({
                                        ...e,
                                        target: {
                                            ...e.target,
                                            name: "cep",
                                            value: valor
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>);
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                name="rua"
                                placeholder="Rua"
                                onChange={handleEndereco}
                                value={form.endereco.rua}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                name="numero"
                                placeholder="Número"
                                onChange={handleEndereco}
                                value={form.endereco.numero}
                            />
                        </div>
                    </div>

                    <div className="grid-3">
                        <div className="input-group">
                            <input
                                name="complemento"
                                placeholder="Complemento"
                                onChange={handleEndereco}
                                value={form.endereco.complemento}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                name="bairro"
                                placeholder="Bairro"
                                onChange={handleEndereco}
                                value={form.endereco.bairro}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                name="cidade"
                                placeholder="Cidade"
                                onChange={handleEndereco}
                                value={form.endereco.cidade}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                name="estado"
                                placeholder="Estado"
                                onChange={handleEndereco}
                                value={form.endereco.estado}
                            />
                        </div>
                    </div>
                </div>

                <h3>
                    <Ruler className="w-5 h-5 mr-2 inline" />
                    Detalhes
                </h3>

                <div className="grid-4">
                    <div className="input-group">
                        <input
                            name="quartos"
                            placeholder="Dormitorios"
                            onChange={handleDetalhes}
                            value={form.detalhes.quartos}
                        />
                    </div>
                    <div className="input-group">

                        <input
                            name="banheiros"
                            placeholder="Banheiro"
                            onChange={handleDetalhes}
                            value={form.detalhes.banheiros}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="number"
                            name="suites"
                            placeholder="Suítes"
                            min="0"
                            onChange={handleDetalhes}
                            value={form.detalhes.suites}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            name="cozinha"
                            placeholder="Cozinha"
                            onChange={handleDetalhes}
                            value={form.detalhes.cozinha}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            name="vagas"
                            placeholder="Vagas de Garagem"
                            onChange={handleDetalhes}
                            value={form.detalhes.vagas}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            name="area"
                            placeholder="Metragem"
                            onChange={handleDetalhes}
                            value={form.detalhes.area}
                        />
                    </div>
                </div>
                <h3>✨ Diferenciais</h3>

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

                <div className="input-group">
                    <textarea
                        name="descricao"
                        placeholder="Descreva o imóvel..."
                        onChange={handleChange}
                        value={form.descricao}
                    />
                </div>

                <div className="input-group">
                    <label className="flex items-center cursor-pointer">
                        <Upload className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>Selecionar imagens</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImage}
                            className="hidden"
                        />
                    </label>
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
                </div>

                <div className="actions">
                    <button type="button" className="btn-secondary" onClick={handlePreview}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver modo cliente
                    </button>

                    <button type="submit" className="btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar imóvel
                    </button>
                </div>
            </div>
        </form>
    );
}