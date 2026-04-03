import { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaClock, 
  FaChartBar, 
  FaUserPlus,
  FaSignOutAlt,
  FaTrash,
  FaEdit,
  FaFilePdf,
  FaFileExcel,
  FaCalendar,
  FaSearch,
  FaTimes,
  FaSave
} from "react-icons/fa";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line 
} from "recharts";
import { api } from "./services/api";
import { relatorios } from "./services/relatorios";
import "./App.css";

function App() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState("dashboard");
  const [funcionarios, setFuncionarios] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalFuncionarios: 0,
    registrosHoje: 0,
    registrosMes: 0,
    registrosPorTipo: [],
    registrosPorDia: [],
    topFuncionarios: []
  });
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    funcionarioId: ""
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    matricula: "",
    cargo: "",
    senha: "",
    tipo: "funcionario",
  });

  const tiposRegistro = {
    ENTRADA_MANHA: "Entrada Manhã",
    SAIDA_MANHA: "Saída Manhã",
    ENTRADA_TARDE: "Entrada Tarde",
    SAIDA_NOITE: "Saída Noite",
  };

  useEffect(() => {
    if (token) {
      carregarDados();
      carregarEstatisticas();
    }
  }, [token]);

  const carregarDados = async () => {
    try {
      const funcionariosData = await api.listarFuncionarios(token);
      setFuncionarios(funcionariosData);
      await carregarRegistros();
    } catch (err) {
      console.error(err);
      setErro(err.message);
      setTimeout(() => setErro(""), 3000);
    }
  };

  const carregarRegistros = async () => {
    try {
      const data = await api.listarRegistros(token, filtros);
      setRegistros(data);
    } catch (err) {
      console.error(err);
      setErro(err.message);
      setTimeout(() => setErro(""), 3000);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const data = await api.getEstatisticas(token);
      setEstatisticas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = await api.login(matricula, senha);
      setToken(data.token);
      setUsuario({ matricula, tipo: "admin" });
      setMatricula("");
      setSenha("");
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUsuario(null);
    setFuncionarios([]);
    setRegistros([]);
    setEstatisticas({
      totalFuncionarios: 0,
      registrosHoje: 0,
      registrosMes: 0,
      registrosPorTipo: [],
      registrosPorDia: [],
      topFuncionarios: []
    });
  };

  const handleCriarFuncionario = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      await api.criarFuncionario(token, novoFuncionario);
      setNovoFuncionario({
        nome: "",
        matricula: "",
        cargo: "",
        senha: "",
        tipo: "funcionario",
      });
      await carregarDados();
      await carregarEstatisticas();
      setAba("funcionarios");
      setErro("Funcionário criado com sucesso!");
      setTimeout(() => setErro(""), 3000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleEditarFuncionario = async (funcionario) => {
    setFuncionarioEditando({
      id: funcionario.id,
      nome: funcionario.nome,
      matricula: funcionario.matricula,
      cargo: funcionario.cargo,
      tipo: funcionario.tipo,
      senha: "",
    });
    setModalEdicao(true);
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const dados = {
        nome: funcionarioEditando.nome,
        matricula: funcionarioEditando.matricula,
        cargo: funcionarioEditando.cargo,
        tipo: funcionarioEditando.tipo,
      };
      
      if (funcionarioEditando.senha && funcionarioEditando.senha.trim() !== "") {
        dados.senha = funcionarioEditando.senha;
      }
      
      await api.atualizarFuncionario(token, funcionarioEditando.id, dados);
      await carregarDados();
      await carregarEstatisticas();
      setModalEdicao(false);
      setFuncionarioEditando(null);
      setErro("Funcionário atualizado com sucesso!");
      setTimeout(() => setErro(""), 3000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirFuncionario = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja excluir o funcionário "${nome}"?`)) return;
    
    setCarregando(true);
    setErro("");
    
    try {
      await api.excluirFuncionario(token, id);
      await carregarDados();
      await carregarEstatisticas();
      setErro("Funcionário excluído com sucesso!");
      setTimeout(() => setErro(""), 3000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    carregarRegistros();
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: "",
      dataFim: "",
      funcionarioId: ""
    });
    setTimeout(() => carregarRegistros(), 100);
  };

  const gerarPDF = async () => {
    setCarregando(true);
    try {
      const registrosAtuais = await api.listarRegistros(token, filtros);
      if (registrosAtuais.length === 0) {
        setErro("Nenhum registro para gerar relatório");
        setTimeout(() => setErro(""), 3000);
        return;
      }
      relatorios.gerarPDF(registrosAtuais, funcionarios, filtros);
      setErro("PDF gerado com sucesso!");
      setTimeout(() => setErro(""), 3000);
    } catch (err) {
      setErro("Erro ao gerar PDF: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  const gerarExcel = async () => {
    setCarregando(true);
    try {
      const registrosAtuais = await api.listarRegistros(token, filtros);
      if (registrosAtuais.length === 0) {
        setErro("Nenhum registro para gerar relatório");
        setTimeout(() => setErro(""), 3000);
        return;
      }
      relatorios.gerarExcel(registrosAtuais, funcionarios, filtros);
      setErro("Excel gerado com sucesso!");
      setTimeout(() => setErro(""), 3000);
    } catch (err) {
      setErro("Erro ao gerar Excel: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  // Tela de Login
  if (!token) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <h1>Sistema Administrativo</h1>
          <h2>Controle de Ponto</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              disabled={carregando}
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
            />
            <button type="submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
            {erro && <p className="erro">{erro}</p>}
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Admin
  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Ponto Manager</h2>
        <nav>
          <button onClick={() => setAba("dashboard")} className={aba === "dashboard" ? "active" : ""}>
            <FaChartBar /> Dashboard
          </button>
          <button onClick={() => setAba("funcionarios")} className={aba === "funcionarios" ? "active" : ""}>
            <FaUsers /> Funcionários
          </button>
          <button onClick={() => setAba("registros")} className={aba === "registros" ? "active" : ""}>
            <FaClock /> Registros
          </button>
          <button onClick={() => setAba("novo")} className={aba === "novo" ? "active" : ""}>
            <FaUserPlus /> Novo Funcionário
          </button>
          <button onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {/* DASHBOARD COM GRÁFICOS */}
        {aba === "dashboard" && (
          <div>
            <h1>Dashboard</h1>
            
            <div className="cards">
              <div className="card">
                <FaUsers size={40} />
                <h3>{estatisticas.totalFuncionarios}</h3>
                <p>Funcionários</p>
              </div>
              <div className="card">
                <FaClock size={40} />
                <h3>{estatisticas.registrosHoje}</h3>
                <p>Registros Hoje</p>
              </div>
              <div className="card">
                <FaChartBar size={40} />
                <h3>{estatisticas.registrosMes}</h3>
                <p>Registros no Mês</p>
              </div>
            </div>

            <div className="charts-grid">
              {/* Gráfico de Pizza - Registros por Tipo */}
              <div className="chart-card">
                <h3>Registros por Tipo (últimos 30 dias)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={estatisticas.registrosPorTipo}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="tipo"
                    >
                      {estatisticas.registrosPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#00cc66", "#ffcc00", "#ff6600", "#ff3366"][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f0f1a", borderColor: "#00ffcc" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Barras - Registros por Dia */}
              <div className="chart-card">
                <h3>Registros nos Últimos 7 Dias</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={estatisticas.registrosPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="data" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip contentStyle={{ backgroundColor: "#0f0f1a", borderColor: "#00ffcc" }} />
                    <Legend />
                    <Bar dataKey="registros" fill="#00cc66" name="Registros" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Linha - Tendência */}
              <div className="chart-card">
                <h3>Tendência de Registros</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={estatisticas.registrosPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="data" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip contentStyle={{ backgroundColor: "#0f0f1a", borderColor: "#00ffcc" }} />
                    <Legend />
                    <Line type="monotone" dataKey="registros" stroke="#00ffcc" strokeWidth={2} name="Registros" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Ranking de Funcionários */}
              <div className="chart-card">
                <h3>Top 5 Funcionários (mais registros no mês)</h3>
                <div className="ranking-list">
                  {estatisticas.topFuncionarios.length === 0 ? (
                    <p>Nenhum registro no mês</p>
                  ) : (
                    estatisticas.topFuncionarios.map((f, index) => (
                      <div key={index} className="ranking-item">
                        <span className="ranking-position">{index + 1}º</span>
                        <span className="ranking-name">{f.nome}</span>
                        <span className="ranking-count">{f.total} registros</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LISTA DE FUNCIONÁRIOS COM EDIÇÃO/EXCLUSÃO */}
        {aba === "funcionarios" && (
          <div>
            <h1>Funcionários</h1>
            {erro && <p className={`mensagem ${erro.includes("sucesso") ? "sucesso" : "erro"}`}>{erro}</p>}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Matrícula</th>
                    <th>Cargo</th>
                    <th>Tipo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map(f => (
                    <tr key={f.id}>
                      <td>{f.id}</td>
                      <td>{f.nome}</td>
                      <td>{f.matricula}</td>
                      <td>{f.cargo}</td>
                      <td>{f.tipo === "admin" ? "Admin" : "Funcionário"}</td>
                      <td className="acoes">
                        <button className="btn-edit" onClick={() => handleEditarFuncionario(f)}>
                          <FaEdit /> Editar
                        </button>
                        <button className="btn-delete" onClick={() => handleExcluirFuncionario(f.id, f.nome)}>
                          <FaTrash /> Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LISTA DE REGISTROS COM FILTROS E RELATÓRIOS */}
        {aba === "registros" && (
          <div>
            <div className="registros-header">
              <h1>Registros de Ponto</h1>
              <div className="acoes-header">
                <button onClick={gerarPDF} className="btn-pdf">
                  <FaFilePdf /> PDF
                </button>
                <button onClick={gerarExcel} className="btn-excel">
                  <FaFileExcel /> Excel
                </button>
                <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="btn-filtro">
                  <FaCalendar /> Filtrar
                </button>
              </div>
            </div>

            {mostrarFiltros && (
              <div className="filtros-area">
                <h3>Filtrar Registros</h3>
                <div className="filtros-grid">
                  <div className="filtro-group">
                    <label>Data Início</label>
                    <input
                      type="date"
                      value={filtros.dataInicio}
                      onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                    />
                  </div>
                  <div className="filtro-group">
                    <label>Data Fim</label>
                    <input
                      type="date"
                      value={filtros.dataFim}
                      onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                    />
                  </div>
                  <div className="filtro-group">
                    <label>Funcionário</label>
                    <select
                      value={filtros.funcionarioId}
                      onChange={(e) => setFiltros({...filtros, funcionarioId: e.target.value})}
                    >
                      <option value="">Todos</option>
                      {funcionarios.map(f => (
                        <option key={f.id} value={f.id}>{f.nome} - {f.matricula}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filtro-buttons">
                    <button onClick={aplicarFiltros} className="btn-aplicar">
                      <FaSearch /> Aplicar
                    </button>
                    <button onClick={limparFiltros} className="btn-limpar">
                      Limpar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {erro && <p className={`mensagem ${erro.includes("sucesso") ? "sucesso" : "erro"}`}>{erro}</p>}
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Matrícula</th>
                    <th>Tipo</th>
                    <th>Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>Nenhum registro encontrado</td>
                    </tr>
                  ) : (
                    registros.map(r => (
                      <tr key={r.id}>
                        <td>{r.funcionario?.nome || "N/A"}</td>
                        <td>{r.funcionario?.matricula || "N/A"}</td>
                        <td>{tiposRegistro[r.tipo] || r.tipo}</td>
                        <td>{new Date(r.dataHora).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CADASTRAR NOVO FUNCIONÁRIO */}
        {aba === "novo" && (
          <div>
            <h1>Novo Funcionário</h1>
            {erro && <p className={`mensagem ${erro.includes("sucesso") ? "sucesso" : "erro"}`}>{erro}</p>}
            <form onSubmit={handleCriarFuncionario} className="admin-form">
              <input
                type="text"
                placeholder="Nome"
                value={novoFuncionario.nome}
                onChange={(e) => setNovoFuncionario({...novoFuncionario, nome: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Matrícula"
                value={novoFuncionario.matricula}
                onChange={(e) => setNovoFuncionario({...novoFuncionario, matricula: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Cargo"
                value={novoFuncionario.cargo}
                onChange={(e) => setNovoFuncionario({...novoFuncionario, cargo: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={novoFuncionario.senha}
                onChange={(e) => setNovoFuncionario({...novoFuncionario, senha: e.target.value})}
                required
              />
              <select
                value={novoFuncionario.tipo}
                onChange={(e) => setNovoFuncionario({...novoFuncionario, tipo: e.target.value})}
              >
                <option value="funcionario">Funcionário</option>
                <option value="admin">Administrador</option>
              </select>
              <button type="submit" disabled={carregando}>
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {modalEdicao && funcionarioEditando && (
        <div className="modal-overlay" onClick={() => setModalEdicao(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Funcionário</h2>
              <button className="modal-close" onClick={() => setModalEdicao(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSalvarEdicao}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={funcionarioEditando.nome}
                  onChange={(e) => setFuncionarioEditando({...funcionarioEditando, nome: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Matrícula</label>
                <input
                  type="text"
                  value={funcionarioEditando.matricula}
                  onChange={(e) => setFuncionarioEditando({...funcionarioEditando, matricula: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cargo</label>
                <input
                  type="text"
                  value={funcionarioEditando.cargo}
                  onChange={(e) => setFuncionarioEditando({...funcionarioEditando, cargo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nova Senha (deixe em branco para manter a atual)</label>
                <input
                  type="password"
                  placeholder="Digite uma nova senha"
                  value={funcionarioEditando.senha}
                  onChange={(e) => setFuncionarioEditando({...funcionarioEditando, senha: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={funcionarioEditando.tipo}
                  onChange={(e) => setFuncionarioEditando({...funcionarioEditando, tipo: e.target.value})}
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setModalEdicao(false)} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" disabled={carregando} className="btn-salvar">
                  <FaSave /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;