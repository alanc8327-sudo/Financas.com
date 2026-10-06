let saldo = 0, receitas = 0, despesas = 0, poupanca = 0;
const lista = document.getElementById("lista");
let graficoBar, graficoPie, graficoLine, graficoEvolucao, graficoSaldo;
let historicoMensal = {}; // { "2026-01": {receitas: X, despesas: Y, poupanca: Z} }

// Alternar abas
function mostrarAba(id) {
  document.querySelectorAll(".aba-conteudo").forEach(sec => sec.classList.remove("ativo"));
  document.getElementById(id).classList.add("ativo");
}

// Atualizar resumo
function atualizarResumo() {
  document.getElementById("saldo").textContent = saldo.toFixed(2);
  document.getElementById("receitas").textContent = receitas.toFixed(2);
  document.getElementById("despesas").textContent = despesas.toFixed(2);
  document.getElementById("poupanca").textContent = poupanca.toFixed(2);
  salvarDados();
}

// Adicionar transação
function adicionar() {
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  if (!descricao || isNaN(valor) || valor <= 0) {
    alert("Preencha corretamente os campos!");
    return;
  }

  const hoje = new Date();
  const chaveMes = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`;
  if (!historicoMensal[chaveMes]) historicoMensal[chaveMes] = { receitas:0, despesas:0, poupanca:0 };

  if (tipo === "receita") { receitas += valor; saldo += valor; historicoMensal[chaveMes].receitas += valor; }
  else if (tipo === "despesa") { despesas += valor; saldo -= valor; historicoMensal[chaveMes].despesas += valor; }
  else if (tipo === "poupanca") { poupanca += valor; saldo -= valor; historicoMensal[chaveMes].poupanca += valor; }

  const linha = document.createElement("tr");
  linha.setAttribute("data-data", hoje.toISOString());
  linha.innerHTML = `
    <td>${descricao}</td>
    <td>R$ ${valor.toFixed(2)}</td>
    <td>${tipo}</td>
    <td><button class="excluir">Excluir</button></td>
  `;
  linha.querySelector(".excluir").addEventListener("click", () => excluir(valor, tipo, linha));
  lista.appendChild(linha);

  atualizarResumo();
  atualizarGraficos();
  atualizarGraficoEvolucao();
  atualizarGraficoSaldo();

  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("tipo").value = "receita";
}

// Excluir transação
function excluir(valor, tipo, linha) {
  if (tipo === "receita") { receitas -= valor; saldo -= valor; }
  else if (tipo === "despesa") { despesas -= valor; saldo += valor; }
  else if (tipo === "poupanca") { poupanca -= valor; saldo += valor; }

  linha.remove();
  atualizarResumo();
  atualizarGraficos();
  atualizarGraficoEvolucao();
  atualizarGraficoSaldo();
}

// Gráficos principais
function atualizarGraficos() {
  const ctxBar = document.getElementById("graficoMensal").getContext("2d");
  const ctxPie = document.getElementById("graficoPizza").getContext("2d");
  const ctxLine = document.getElementById("graficoLinha").getContext("2d");

  if (graficoBar) graficoBar.destroy();
  if (graficoPie) graficoPie.destroy();
  if (graficoLine) graficoLine.destroy();

  graficoBar = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: ["Receitas", "Despesas", "Poupança", "Saldo"],
      datasets: [{
        label: "Balanço Mensal",
        data: [receitas, despesas, poupanca, saldo],
        backgroundColor: ["#4caf50", "#f44336", "#2196f3", "#ff9800"]
      }]
    }
  });

  graficoPie = new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: ["Receitas", "Despesas", "Poupança"],
      datasets: [{
        data: [receitas, despesas, poupanca],
        backgroundColor: ["#4caf50", "#f44336", "#2196f3"]
      }]
    }
  });

  graficoLine = new Chart(ctxLine, {
    type: "line",
    data: {
      labels: ["Receitas", "Despesas", "Poupança", "Saldo"],
      datasets: [{
        label: "Evolução",
        data: [receitas, despesas, poupanca, saldo],
        borderColor: "#2c3e50",
        fill: false
      }]
    }
  });
}

// Gráfico de evolução mensal
function atualizarGraficoEvolucao() {
  const ctx = document.getElementById("graficoEvolucao")?.getContext("2d");
  if (!ctx) return;
  if (graficoEvolucao) graficoEvolucao.destroy();

  const meses = Object.keys(historicoMensal).sort();
  const receitasData = meses.map(m => historicoMensal[m].receitas);
  const despesasData = meses.map(m => historicoMensal[m].despesas);
  const poupancaData = meses.map(m => historicoMensal[m].poupanca);

  graficoEvolucao = new Chart(ctx, {
    type: "line",
    data: {
      labels: meses,
      datasets: [
        { label: "Receitas", data: receitasData, borderColor: "#4caf50", fill: false },
        { label: "Despesas", data: despesasData, borderColor: "#f44336", fill: false },
        { label: "Poupança", data: poupancaData, borderColor: "#2196f3", fill: false }
      ]
    }
  });
}

// Gráfico de saldo acumulado
function atualizarGraficoSaldo() {
  const ctx = document.getElementById("graficoSaldo")?.getContext("2d");
  if (!ctx) return;
  if (graficoSaldo) graficoSaldo.destroy();

  const meses = Object.keys(historicoMensal).sort();
  let acumulado = 0;
  const saldoData = meses.map(m => {
    acumulado += (historicoMensal[m].receitas - historicoMensal[m].despesas - historicoMensal[m].poupanca);
    return acumulado;
  });

  graficoSaldo = new Chart(ctx, {
    type: "line",
    data: {
      labels: meses,
      datasets: [{
        label: "Saldo Acumulado",
        data: saldoData,
        borderColor: "#ff9800",
        fill: false,
        tension: 0.3
      }]
    }
  });
}

// Exportar PDF filtrado
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Relatório Financeiro", 10, 10);
  doc.text(`Saldo: R$ ${saldo.toFixed(2)}`, 10, 20);
  doc.text(`Receitas: R$ ${receitas.toFixed(2)}`, 10, 30);
  doc.text(`Despesas: R$ ${despesas.toFixed(2)}`, 10, 40);
  doc.text(`Poupança: R$ ${poupanca.toFixed(2)}`, 10, 50);

  let y = 70;
  doc.text("Transações:", 10, y);
  y += 10;

  const linhasVisiveis = Array.from(document.querySelectorAll("#lista tr"))
    .filter(tr => tr.style.display !== "none");

  linhasVisiveis.forEach(tr => {
    const cols = Array.from(tr.querySelectorAll("td")).map(td => td.innerText);
    doc.text(`${cols[0]} - ${cols[1]} - ${cols[2]}`, 10, y);
    y += 10;
  });

  doc.save("relatorio_filtrado.pdf");
}

// Exportar Excel filtrado
function gerarPlanilha() {
  const dados = [["Descrição", "Valor", "Tipo"]];
  const linhasVisiveis = Array.from(document.querySelectorAll("#lista tr"))
    .filter(tr => tr.style.display !== "none");

  linhasVisiveis.forEach(tr => {
    const cols = Array.from(tr.querySelectorAll("td")).map(td => td.innerText);
    dados.push(cols.slice(0,3)); // só pega descrição, valor e tipo
  });

  const ws = XLSX.utils.aoa_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Financeiro");
  XLSX.writeFile(wb, "relatorio_filtrado.xlsx");
}

// Armazenamento Local
function salvarDados() {
  const dados = { saldo, receitas, despesas, poupanca, historico: lista.innerHTML, historicoMensal };
  localStorage.setItem("financeiro", JSON.stringify(dados));
}

function carregarDados() {
  const dados = JSON.parse(localStorage.getItem("financeiro"));
  if (dados) {
    saldo = dados.saldo;
    receitas = dados.receitas;
    despesas = dados.despesas;
    poupanca = dados.poupanca;
    historicoMensal = dados.historicoMensal || {};
    lista.innerHTML = dados.historico;
    lista.querySelectorAll(".excluir").forEach(btn => {
      const linha = btn.closest("tr");
      const valor = parseFloat(linha.children[1].innerText.replace("R$",""));
      const tipo = linha.children[2].innerText;
      btn.addEventListener("click", () => excluir(valor, tipo, linha));
    });
    atualizarResumo();
    atualizarGraficos();
    atualizarGraficoEvolucao();
    atualizarGraficoSaldo();
  }
}

carregarDados();
