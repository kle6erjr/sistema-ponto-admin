// src/services/relatorios.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const tiposRegistro = {
  ENTRADA_MANHA: "Entrada Manhã",
  SAIDA_MANHA: "Saída Manhã",
  ENTRADA_TARDE: "Entrada Tarde",
  SAIDA_NOITE: "Saída Noite",
};

export const relatorios = {
  // Gerar PDF
  gerarPDF(registros, funcionarios, filtros) {
    // Criar documento em paisagem
    const doc = new jsPDF("landscape");
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Registros de Ponto", 14, 20);
    
    // Subtítulo com filtros
    doc.setFontSize(10);
    let filtroTexto = "Período: ";
    if (filtros.dataInicio && filtros.dataFim) {
      filtroTexto += `${this.formatarData(filtros.dataInicio)} até ${this.formatarData(filtros.dataFim)}`;
    } else if (filtros.dataInicio) {
      filtroTexto += `A partir de ${this.formatarData(filtros.dataInicio)}`;
    } else if (filtros.dataFim) {
      filtroTexto += `Até ${this.formatarData(filtros.dataFim)}`;
    } else {
      filtroTexto += "Todos os registros";
    }
    
    if (filtros.funcionarioId) {
      const funcionario = funcionarios.find(f => f.id === parseInt(filtros.funcionarioId));
      filtroTexto += ` | Funcionário: ${funcionario?.nome || "Selecionado"}`;
    }
    
    doc.text(filtroTexto, 14, 28);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 35);
    
    // Preparar dados da tabela
    const dadosTabela = registros.map(r => [
      r.funcionario?.nome || "N/A",
      r.funcionario?.matricula || "N/A",
      tiposRegistro[r.tipo] || r.tipo,
      new Date(r.dataHora).toLocaleDateString("pt-BR"),
      new Date(r.dataHora).toLocaleTimeString("pt-BR"),
    ]);
    
    // Configurar tabela com autoTable
    autoTable(doc, {
      startY: 42,
      head: [["Funcionário", "Matrícula", "Tipo", "Data", "Hora"]],
      body: dadosTabela,
      theme: "striped",
      headStyles: {
        fillColor: [0, 204, 102],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 245],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });
    
    // Salvar PDF
    const dataAtual = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    doc.save(`relatorio_ponto_${dataAtual}.pdf`);
  },
  
  // Gerar Excel
  gerarExcel(registros, funcionarios, filtros) {
    // Preparar dados para Excel
    const dados = registros.map(r => ({
      "Funcionário": r.funcionario?.nome || "N/A",
      "Matrícula": r.funcionario?.matricula || "N/A",
      "Cargo": r.funcionario?.cargo || "N/A",
      "Tipo": tiposRegistro[r.tipo] || r.tipo,
      "Data": new Date(r.dataHora).toLocaleDateString("pt-BR"),
      "Hora": new Date(r.dataHora).toLocaleTimeString("pt-BR"),
      "Data/Hora Completa": new Date(r.dataHora).toLocaleString("pt-BR"),
    }));
    
    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(dados);
    
    // Ajustar largura das colunas
    ws["!cols"] = [
      { wch: 25 }, // Funcionário
      { wch: 12 }, // Matrícula
      { wch: 20 }, // Cargo
      { wch: 18 }, // Tipo
      { wch: 12 }, // Data
      { wch: 10 }, // Hora
      { wch: 22 }, // Data/Hora Completa
    ];
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros de Ponto");
    
    // Adicionar resumo em outra aba
    const resumo = [
      ["RELATÓRIO DE PONTO"],
      [""],
      ["Período:", this.getPeriodoTexto(filtros)],
      ["Total de registros:", registros.length],
      ["Gerado em:", new Date().toLocaleString("pt-BR")],
      [""],
      ["RESUMO POR FUNCIONÁRIO"],
      ["Funcionário", "Total de Registros"],
    ];
    
    // Calcular total por funcionário
    const totalPorFuncionario = {};
    registros.forEach(r => {
      const nome = r.funcionario?.nome || "N/A";
      totalPorFuncionario[nome] = (totalPorFuncionario[nome] || 0) + 1;
    });
    
    for (const [nome, total] of Object.entries(totalPorFuncionario)) {
      resumo.push([nome, total]);
    }
    
    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");
    
    // Salvar arquivo
    const dataAtual = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    XLSX.writeFile(wb, `relatorio_ponto_${dataAtual}.xlsx`);
  },
  
  formatarData(dataStr) {
    if (!dataStr) return "";
    const data = new Date(dataStr);
    return data.toLocaleDateString("pt-BR");
  },
  
  getPeriodoTexto(filtros) {
    if (filtros.dataInicio && filtros.dataFim) {
      return `${this.formatarData(filtros.dataInicio)} até ${this.formatarData(filtros.dataFim)}`;
    } else if (filtros.dataInicio) {
      return `A partir de ${this.formatarData(filtros.dataInicio)}`;
    } else if (filtros.dataFim) {
      return `Até ${this.formatarData(filtros.dataFim)}`;
    }
    return "Todos os registros";
  },
};