// src/services/api.js
const API_URL = "http://localhost:3000";

export const api = {
  // Login
  async login(matricula, senha) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula, senha }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro no login");
    }

    return response.json();
  },

  // Listar funcionários
  async listarFuncionarios(token) {
    const response = await fetch(`${API_URL}/funcionarios`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro ao listar funcionários");
    }

    return response.json();
  },

  // Buscar funcionário por ID
  async buscarFuncionario(token, id) {
    const response = await fetch(`${API_URL}/funcionarios/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro ao buscar funcionário");
    }

    return response.json();
  },

  // Criar funcionário
  async criarFuncionario(token, dados) {
    const response = await fetch(`${API_URL}/funcionarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro ao criar funcionário");
    }

    return response.json();
  },

  // Atualizar funcionário
  async atualizarFuncionario(token, id, dados) {
    const response = await fetch(`${API_URL}/funcionarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro ao atualizar funcionário");
    }

    return response.json();
  },

  // Excluir funcionário
  async excluirFuncionario(token, id) {
    const response = await fetch(`${API_URL}/funcionarios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro ao excluir funcionário");
    }

    return response.json();
  },

  // Listar registros com filtro
  async listarRegistros(token, filtros = {}) {
    let url = `${API_URL}/registros/filtro?`;
    if (filtros.dataInicio) url += `dataInicio=${filtros.dataInicio}&`;
    if (filtros.dataFim) url += `dataFim=${filtros.dataFim}&`;
    if (filtros.funcionarioId) url += `funcionarioId=${filtros.funcionarioId}&`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro ao listar registros");
    }

    return response.json();
  },

  // Buscar estatísticas do dashboard
  async getEstatisticas(token) {
    const response = await fetch(`${API_URL}/dashboard/estatisticas`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro ao buscar estatísticas");
    }

    return response.json();
  },
};