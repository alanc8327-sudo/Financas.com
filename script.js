let saldo = 0, receitas = 0, despesas = 0, poupanca = 0;
const lista = document.getElementById("lista");
let graficoBar, graficoPie, graficoLine;

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

  if (tipo === "receita") { receitas += valor; saldo += valor; }
  else if (tipo === "despesa") { despesas += valor; saldo -= valor; }
  else if (tipo === "poupanca") { poupanca += valor; saldo -= valor; }

  const linha = document.createElement("tr");
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
}

// Atualizar gráficos
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

// Exportar PDF
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Relatório Financeiro", 10, 10);
  doc.text(`Saldo: R$ ${saldo.toFixed(2)}`, 10, 20);
  doc.text(`Receitas: R$ ${receitas.toFixed(2)}`, 10, 30);
  doc.text(`Despesas: R$ ${despesas.toFixed(2)}`, 10, 40);
  doc.text(`Poupança: R$ ${poupanca.toFixed(2)}`, 10, 50);
  doc.save("relatorio.pdf");
}

// Exportar Excel
function gerarPlanilha() {
  const dados = [
    ["Descrição", "Valor", "Tipo"],
    ...Array.from(document.querySelectorAll("#lista tr")).map(tr =>
      Array.from(tr.querySelectorAll("td")).map(td => td.innerText)
    )
  ];
  const ws = XLSX.utils.aoa_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Financeiro");
  XLSX.writeFile(wb, "relatorio.xlsx");
}


function filtrarPorMes() {
  const mes = parseInt(document.getElementById("mes").value);
  const ano = parseInt(document.getElementById("ano").value);

  const linhas = lista.querySelectorAll("tr");
  linhas.forEach(linha => {
    const dataAttr = linha.getAttribute("data-data"); // armazenaremos a data aqui
    if (dataAttr) {
      const data = new Date(dataAttr);
      if (data.getMonth() + 1 === mes && data.getFullYear() === ano) {
        linha.style.display = "";
      } else {
        linha.style.display = "none";
      }
    }
  });
}

function adicionar() {
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  if (!descricao || isNaN(valor) || valor <= 0) {
    alert("Preencha corretamente os campos!");
    return;
  }

  if (tipo === "receita") { receitas += valor; saldo += valor; }
  else if (tipo === "despesa") { despesas += valor; saldo -= valor; }
  else if (tipo === "poupanca") { poupanca += valor; saldo -= valor; }

  const linha = document.createElement("tr");
  const hoje = new Date();
  linha.setAttribute("data-data", hoje.toISOString()); // salva a data da transação
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

  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("tipo").value = "receita";
}






// Armazenamento Local
function salvarDados() {
  const dados = { saldo, receitas, despesas, poupanca, historico: lista.innerHTML };
  localStorage.setItem("financeiro", JSON.stringify(dados));
}

function carregarDados() {
  const dados = JSON.parse(localStorage.getItem("financeiro"));
  if (dados) {
    saldo = dados.saldo;
    receitas = dados.receitas;
    despesas = dados.despesas;
    poupanca = dados.poupanca;
    lista.innerHTML = dados.historico;
    lista.querySelectorAll(".excluir").forEach(btn => {
      const linha = btn.closest("tr");
      const valor = parseFloat(linha.children[1].innerText.replace("R$",""));
      const tipo = linha.children[2].innerText;
      btn.addEventListener("click", () => excluir(valor, tipo, linha));
    });
    atualizarResumo();
    atualizarGraficos();
  }
}

carregarDados();
