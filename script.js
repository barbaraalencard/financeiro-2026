let SENHA = "Flora2026";

// ==========================
// DADOS
// ==========================

let despesas = [];
let receitas = [];
let metas = [];

let mesesArquivados = [];

let indiceMetaEditando = null;
let indiceDespesaEditando = null;
let indiceReceitaEditando = null;

let ultimoBackup = null;


// ==========================
// ELEMENTOS
// ==========================

const lista =
    document.getElementById("lista-lancamentos");

const btnNovaDespesa =
    document.getElementById("btnNovaDespesa");

const btnNovaReceita =
    document.getElementById("btnNovaReceita");

const modalDespesa =
    document.getElementById("modalDespesa");

const modalReceita =
    document.getElementById("modalReceita");

const salvarDespesa =
    document.getElementById("salvarDespesa");

const salvarReceita =
    document.getElementById("salvarReceita");

const cancelarDespesa =
    document.getElementById("cancelarDespesa");

const cancelarReceita =
    document.getElementById("cancelarReceita");

const parcelado =
    document.getElementById("parcelado");

const campoParcelas =
    document.getElementById("campoParcelas");

const paginaConfig =
    document.getElementById("pagina-config");


// ==========================
// MODAIS
// ==========================

btnNovaDespesa.onclick = () => {

    indiceDespesaEditando = null;

    limparFormularioDespesa();

    modalDespesa.style.display = "flex";

};

btnNovaReceita.onclick = () => {

    indiceReceitaEditando = null;

    limparFormularioReceita();

    modalReceita.style.display = "flex";

};

cancelarDespesa.onclick = () => {

    modalDespesa.style.display = "none";

};

cancelarReceita.onclick = () => {

    modalReceita.style.display = "none";

};

window.onclick = (event) => {

    if(event.target === modalDespesa){
        modalDespesa.style.display = "none";
    }

    if(event.target === modalReceita){
        modalReceita.style.display = "none";
    }

};


// ==========================
// PARCELAMENTO
// ==========================

parcelado.addEventListener("change", () => {

    campoParcelas.style.display =
        parcelado.checked ? "flex" : "none";

});


// ==========================
// FUNÇÕES DE DATA
// ==========================

function criarDataLocal(data){

    const [ano, mes, dia] =
        data.split("-");

    return new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
    );

}

function formatarDataISO(data){

    return `${data.getFullYear()}-${String(
        data.getMonth() + 1
    ).padStart(2, "0")}-${String(
        data.getDate()
    ).padStart(2, "0")}`;

}


// ==========================
// SALVAR DESPESA
// ==========================

salvarDespesa.onclick = async () => {

    const descricao =
        document.getElementById("descricao").value.trim();

    const valor =
        Number(document.getElementById("valor").value);

    const categoria =
        document.getElementById("categoria").value;

    const data =
        document.getElementById("data").value;

    const ehParcelado =
        document.getElementById("parcelado").checked;

    const parcelaAtual =
        document.getElementById("parcelaAtual").value || "";

    const totalParcelas =
        Number(
            document.getElementById("totalParcelas").value
        ) || "";

    if(!descricao || !valor || valor <= 0 || !data){

        alert("Preencha descrição, valor e data da despesa.");
        return;

    }

    if(ehParcelado){

        if(
            !parcelaAtual ||
            !totalParcelas ||
            Number(parcelaAtual) < 1 ||
            Number(totalParcelas) < Number(parcelaAtual)
        ){

            alert("Informe uma parcela atual válida e o total de parcelas.");
            return;

        }

    }

    if(indiceDespesaEditando !== null){

        const despesaOriginal =
            despesas[indiceDespesaEditando];

        if(despesaOriginal.grupoParcelamento){

            const grupo =
                despesaOriginal.grupoParcelamento;

            despesas = despesas.filter(
                item =>
                    item.grupoParcelamento !== grupo
            );

            const dataBase =
                criarDataLocal(data);

            for(
                let parcela = 1;
                parcela <= Number(totalParcelas);
                parcela++
            ){

                const novaData =
                    new Date(dataBase);

                novaData.setMonth(
                    dataBase.getMonth() +
                    (parcela - 1)
                );

                despesas.push({

                    descricao,
                    valor,
                    categoria,

                    data:
                        formatarDataISO(novaData),

                    ehParcelado: true,

                    parcelaAtual: parcela,

                    totalParcelas,

                    grupoParcelamento: grupo,

                    pago: false

                });

            }

        } else {

            despesas[indiceDespesaEditando] = {

                descricao,
                valor,
                categoria,
                data,

                ehParcelado,

                parcelaAtual:
                    ehParcelado ? parcelaAtual : "",

                totalParcelas:
                    ehParcelado ? totalParcelas : "",

                grupoParcelamento:
                    despesas[indiceDespesaEditando].grupoParcelamento || null,

                pago:
                    despesas[indiceDespesaEditando].pago || false

            };

        }

    } else {

        if(ehParcelado){

            const dataBase =
                criarDataLocal(data);

            const grupoParcelamento =
                Date.now();

            for(
                let parcela = Number(parcelaAtual);
                parcela <= Number(totalParcelas);
                parcela++
            ){

                const novaData =
                    new Date(dataBase);

                novaData.setMonth(
                    dataBase.getMonth() +
                    (parcela - Number(parcelaAtual))
                );

                despesas.push({

                    descricao,
                    valor,
                    categoria,

                    data:
                        formatarDataISO(novaData),

                    ehParcelado: true,

                    parcelaAtual: parcela,

                    totalParcelas,

                    grupoParcelamento,

                    pago: false

                });

            }

        } else {

            despesas.push({

                descricao,
                valor,
                categoria,
                data,

                ehParcelado: false,

                parcelaAtual: "",

                totalParcelas: "",

                grupoParcelamento: null,

                pago: false

            });

        }

    }

    indiceDespesaEditando = null;

    const criouReceitaFixa =
        aplicarReceitasFixasNosMesesComGastos();

    await salvarDespesasFirebase(despesas);

    if(criouReceitaFixa){
        await salvarReceitasFirebase(receitas);
    }

    atualizarTelas();

    limparFormularioDespesa();

    modalDespesa.style.display = "none";

};

// ==========================
// SALVAR RECEITA
// ==========================

salvarReceita.onclick = async () => {

    const descricao =
        document.getElementById("descricaoReceita").value.trim();

    const valor =
        Number(document.getElementById("valorReceita").value);

    const data =
        document.getElementById("dataReceita").value;

    const ehReceitaFixa =
        document.getElementById("receitaFixa")?.checked || false;

    if(!descricao || !valor || valor <= 0 || !data){

        alert("Preencha descrição, valor e data da receita.");
        return;

    }

    if(indiceReceitaEditando !== null){

        const receitaOriginal =
            receitas[indiceReceitaEditando];

        if(receitaOriginal.grupoReceitaFixa){

            const grupoReceitaFixa =
                receitaOriginal.grupoReceitaFixa;

            receitas = receitas.filter(
                item =>
                    item.grupoReceitaFixa !== grupoReceitaFixa
            );

            if(ehReceitaFixa){

                criarReceitasFixas({
                    descricao,
                    valor,
                    data,
                    grupoReceitaFixa
                });

            } else {

                receitas.push({
                    descricao,
                    valor,
                    data,
                    receitaFixa: false,
                    grupoReceitaFixa: null
                });

            }

        } else {

            receitas[indiceReceitaEditando] = {
                descricao,
                valor,
                data,
                receitaFixa: ehReceitaFixa,
                grupoReceitaFixa:
                    ehReceitaFixa ? Date.now() : null
            };

            if(ehReceitaFixa){

                const receitaEditada =
                    receitas[indiceReceitaEditando];

                receitas.splice(indiceReceitaEditando, 1);

                criarReceitasFixas({
                    descricao: receitaEditada.descricao,
                    valor: receitaEditada.valor,
                    data: receitaEditada.data,
                    grupoReceitaFixa: receitaEditada.grupoReceitaFixa
                });

            }

        }

        indiceReceitaEditando = null;

    } else {

        if(ehReceitaFixa){

            criarReceitasFixas({
                descricao,
                valor,
                data,
                grupoReceitaFixa: Date.now()
            });

        } else {

            receitas.push({
                descricao,
                valor,
                data,
                receitaFixa: false,
                grupoReceitaFixa: null
            });

        }

    }

    await salvarReceitasFirebase(receitas);

    atualizarTelas();

    limparFormularioReceita();

    modalReceita.style.display = "none";

};


// ==========================
// LIMPAR FORMULÁRIOS
// ==========================

function limparFormularioDespesa(){

    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("data").value = "";

    document.getElementById("parcelado").checked = false;

    document.getElementById("parcelaAtual").value = "";
    document.getElementById("totalParcelas").value = "";

    campoParcelas.style.display = "none";

}

function limparFormularioReceita(){

    document.getElementById("descricaoReceita").value = "";
    document.getElementById("valorReceita").value = "";
    document.getElementById("dataReceita").value = "";
    document.getElementById("receitaFixa").checked = false;

}


// ==========================
// FILTROS
// ==========================

function obterMesAno(data){

    if(!data) return "";

    return data.substring(0, 7);

}

function obterFiltroStatus(){

    return (
        document.getElementById("filtroStatus")?.value
        || "todos"
    );

}

function passaFiltroMes(item, filtroMes){

    const mesItem =
        obterMesAno(item.data);

    if(mesEstaArquivado(mesItem)){
        return false;
    }

    if(filtroMes === "todos"){
        return true;
    }

    return mesItem === filtroMes;

}

function mesEstaArquivado(mesAno){

    return mesesArquivados.includes(mesAno);

}

function normalizarMesesArquivados(lista){

    return [
        ...new Set(
            (lista || []).filter(Boolean)
        )
    ];

}

function obterMesesComRegistros(){

    const meses =
        new Set();

    despesas.forEach(item => {
        meses.add(obterMesAno(item.data));
    });

    receitas.forEach(item => {
        meses.add(obterMesAno(item.data));
    });

    return ordenarMesesPorProximidade(
        [...meses]
        .filter(Boolean)
    );

}

function obterMesesParaReceitaFixa(dataReceita){

    const meses =
        new Set();

    despesas.forEach(item => {
        meses.add(obterMesAno(item.data));
    });

    meses.add(
        obterMesAno(dataReceita)
    );

    return ordenarMesesPorProximidade(
        [...meses].filter(Boolean)
    );

}

function aplicarReceitasFixasNosMesesComGastos(){

    const grupos =
        new Map();

    receitas.forEach(item => {

        if(item.grupoReceitaFixa && !grupos.has(item.grupoReceitaFixa)){
            grupos.set(item.grupoReceitaFixa, item);
        }

    });

    if(grupos.size === 0){
        return false;
    }

    const mesesComGastos =
        new Set();

    despesas.forEach(item => {
        mesesComGastos.add(obterMesAno(item.data));
    });

    let criouReceita =
        false;

    grupos.forEach((receitaBase, grupoReceitaFixa) => {

        mesesComGastos.forEach(mesAno => {

            const jaExiste =
                receitas.some(item =>
                    item.grupoReceitaFixa === grupoReceitaFixa &&
                    obterMesAno(item.data) === mesAno
                );

            if(jaExiste){
                return;
            }

            receitas.push({
                descricao: receitaBase.descricao,
                valor: receitaBase.valor,
                data: criarDataNoMes(mesAno, receitaBase.data),
                receitaFixa: true,
                grupoReceitaFixa
            });

            criouReceita = true;

        });

    });

    return criouReceita;

}

function criarDataNoMes(mesAno, dataReferencia){

    const diaReferencia =
        Number(dataReferencia.split("-")[2]);

    const [ano, mes] =
        mesAno.split("-").map(Number);

    const ultimoDiaMes =
        new Date(ano, mes, 0).getDate();

    const dia =
        Math.min(diaReferencia, ultimoDiaMes);

    return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

}

function criarReceitasFixas({
    descricao,
    valor,
    data,
    grupoReceitaFixa
}){

    const meses =
        obterMesesParaReceitaFixa(data);

    meses.forEach(mesAno => {

        const jaExiste =
            receitas.some(item =>
                item.grupoReceitaFixa === grupoReceitaFixa &&
                obterMesAno(item.data) === mesAno
            );

        if(jaExiste){
            return;
        }

        receitas.push({
            descricao,
            valor,
            data: criarDataNoMes(mesAno, data),
            receitaFixa: true,
            grupoReceitaFixa
        });

    });

}

function obterMesAtualReferencia(){

    const hoje =
        new Date();

    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

}

function calcularDistanciaMes(mesAno){

    const [ano, mes] =
        mesAno.split("-").map(Number);

    const [anoAtual, mesAtual] =
        obterMesAtualReferencia()
            .split("-")
            .map(Number);

    return (
        (ano - anoAtual) * 12 +
        (mes - mesAtual)
    );

}

function ordenarMesesPorProximidade(meses){

    return meses.sort((mesA, mesB) => {

        const distanciaA =
            calcularDistanciaMes(mesA);

        const distanciaB =
            calcularDistanciaMes(mesB);

        const distanciaAbsolutaA =
            Math.abs(distanciaA);

        const distanciaAbsolutaB =
            Math.abs(distanciaB);

        if(distanciaAbsolutaA !== distanciaAbsolutaB){
            return distanciaAbsolutaA - distanciaAbsolutaB;
        }

        return distanciaB - distanciaA;

    });

}

function passaFiltroStatus(item){

    const filtroStatus =
        obterFiltroStatus();

    if(filtroStatus === "pendentes" && item.pago){
        return false;
    }

    if(filtroStatus === "pagos" && !item.pago){
        return false;
    }

    return true;

}

function nomeMes(mesAno){

    const [ano, mes] =
        mesAno.split("-");

    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    return `${meses[Number(mes) - 1]} ${ano}`;

}

function nomeMesCurto(mesAno){

    if(mesAno === "todos"){
        return "Todos";
    }

    const [ano, mes] =
        mesAno.split("-");

    const meses = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez"
    ];

    return `${meses[Number(mes) - 1]} ${ano}`;

}

function formatarMoeda(valor){

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}

function atualizarFiltroMes(){

    const select =
        document.getElementById("filtroMes");

    const botoesMeses =
        document.getElementById("botoesMeses");

    if(!select) return;

    const meses =
        obterMesesComRegistros()
            .filter(mes => !mesEstaArquivado(mes));

    const valorAtual =
        select.value;

    select.innerHTML = `
        <option value="todos">
            Todos os meses
        </option>
    `;

    meses
        .forEach(mes => {

            select.innerHTML += `
                <option value="${mes}">
                    ${nomeMes(mes)}
                </option>
            `;

        });

    if(
        valorAtual &&
        meses.includes(valorAtual) &&
        !mesEstaArquivado(valorAtual)
    ){
        select.value = valorAtual;
    } else {
        select.value = "todos";
    }

    if(botoesMeses){

        const mesesBotoes =
            [...meses, "todos"];

        botoesMeses.innerHTML =
            mesesBotoes.map(mes => {

                const ativo =
                    select.value === mes ? "ativo" : "";

                const texto =
                    mes === "todos"
                        ? "Todos"
                        : nomeMesCurto(mes);

                return `
                    <button
                        type="button"
                        class="botao-mes ${ativo}"
                        onclick="selecionarMes('${mes}')">
                        ${texto}
                    </button>
                `;

            }).join("");

    }

}

function selecionarMes(mesAno){

    const select =
        document.getElementById("filtroMes");

    if(!select){
        return;
    }

    select.value = mesAno;

    atualizarTelas();

}


// ==========================
// LANÇAMENTOS HOME
// ==========================

function renderizar(){

    lista.innerHTML = "";

    const lancamentos = [];

    despesas.forEach((item, indice) => {

        lancamentos.push({
            tipo: "despesa",
            indice,
            ...item
        });

    });

    receitas.forEach((item, indice) => {

        lancamentos.push({
            tipo: "receita",
            indice,
            ...item
        });

    });

    const filtroMes =
        document.getElementById("filtroMes")?.value || "todos";

    const filtroStatus =
        obterFiltroStatus();

    const lancamentosFiltrados =
        lancamentos.filter(item => {

            if(!passaFiltroMes(item, filtroMes)){
                return false;
            }

            if(item.tipo === "receita"){

                return filtroStatus === "todos";

            }

            return passaFiltroStatus(item);

        });

    if(lancamentosFiltrados.length === 0){

        lista.innerHTML =
            "<p>Nenhum lançamento encontrado.</p>";

        return;

    }

    lancamentosFiltrados.reverse();

    lancamentosFiltrados.forEach(item => {

        if(item.tipo === "receita"){

            lista.innerHTML += `
                <div class="lancamento-card receita-card">

                    <div class="lancamento-topo">
                        <div>
                            <span class="lancamento-tipo">💰 Receita</span>
                            <strong>${item.descricao || "Sem descrição"}</strong>
                        </div>
                        <span class="lancamento-valor positivo">
                            ${formatarMoeda(item.valor)}
                        </span>
                    </div>

                    <div class="lancamento-detalhes">
                        <span>📅 ${formatarData(item.data)}</span>
                    </div>

                    <div class="acoes-lancamento">
                        <button
                            class="btn-editar"
                            onclick="editarReceita(${item.indice})">
                            ✏️ Editar
                        </button>

                        <button
                            class="btn-excluir"
                            onclick="excluirReceita(${item.indice})">
                            🗑 Excluir
                        </button>
                    </div>

                </div>
            `;

        } else {

            let parcelaTexto = "";

            if(
                item.ehParcelado &&
                item.parcelaAtual &&
                item.totalParcelas
            ){

                parcelaTexto =
                    `<span>📦 ${item.parcelaAtual}/${item.totalParcelas}</span>`;

            }

            lista.innerHTML += `
                <div class="lancamento-card despesa-card">

                    <div class="lancamento-topo">
                        <div>
                            <span class="lancamento-tipo">💸 Despesa</span>
                            <strong>${item.descricao || "Sem descrição"}</strong>
                        </div>
                        <span class="lancamento-valor negativo">
                            ${formatarMoeda(item.valor)}
                        </span>
                    </div>

                    <div class="lancamento-detalhes">
                        <span>🏷️ ${item.categoria || "Outros"}</span>
                        ${parcelaTexto}
                        <span>📅 ${formatarData(item.data)}</span>
                    </div>

                    <div class="lancamento-rodape">
                        ${item.pago ? `
                        <span class="selo-pago">
                            ✅ Pago
                        </span>
                        ` : `<span class="selo-pendente">Pendente</span>`}
                    </div>

                    <div class="acoes-lancamento">
                        <button
                            class="btn-editar"
                            onclick="editarDespesa(${item.indice})">
                            ✏️ Editar
                        </button>

                        <button
                            class="btn-excluir"
                            onclick="excluirDespesa(${item.indice})">
                            🗑 Excluir
                        </button>

                        <button
                            class="${item.pago ? 'btn-desfazer' : 'btn-pago'}"
                            onclick="alternarPagamento(${item.indice})">
                            ${item.pago ? "↩️ Desfazer" : "✅ Pago"}
                        </button>
                    </div>

                </div>
            `;

        }

    });

}

// ==========================
// RESUMO
// ==========================

function atualizarResumo(){

    const filtroMes =
        document.getElementById("filtroMes")?.value || "todos";

    const despesasFiltradas =
        despesas.filter(item =>
            passaFiltroMes(item, filtroMes)
        );

    const receitasFiltradas =
        receitas.filter(item =>
            passaFiltroMes(item, filtroMes)
        );

    const totalDespesas =
        despesasFiltradas
            .filter(item => !item.pago)
            .reduce(
                (total, item) =>
                    total + Number(item.valor),
                0
            );

    const totalReceitas =
        receitasFiltradas.reduce(
            (total, item) =>
                total + Number(item.valor),
            0
        );

    const saldo =
        totalReceitas - totalDespesas;

    document.querySelector(".despesas span")
        .textContent =
        totalDespesas.toLocaleString(
            "pt-BR",
            {
                style:"currency",
                currency:"BRL"
            }
        );

    document.querySelector(".receitas span")
        .textContent =
        totalReceitas.toLocaleString(
            "pt-BR",
            {
                style:"currency",
                currency:"BRL"
            }
        );

    document.querySelector(".saldo span")
        .textContent =
        saldo.toLocaleString(
            "pt-BR",
            {
                style:"currency",
                currency:"BRL"
            }
        );

}


// ==========================
// PARCELAS CARD
// ==========================

function atualizarParcelas(){

    const filtroMes =
        document.getElementById("filtroMes")?.value || "todos";

    const filtroStatus =
        obterFiltroStatus();

    let parcelasAtivas =
        despesas.filter(
            item =>
                item.ehParcelado &&
                passaFiltroMes(item, filtroMes)
        );

    if(filtroStatus !== "todos"){

        parcelasAtivas =
            parcelasAtivas.filter(item =>
                passaFiltroStatus(item)
            );

    }

    document.querySelector(".parcelas span")
        .textContent =
        parcelasAtivas.length;

}


// ==========================
// EXCLUIR
// ==========================

async function excluirDespesa(indice){

    if(!confirm("Deseja excluir esta despesa?")){
        return;
    }

    despesas.splice(indice, 1);

    await salvarDespesasFirebase(despesas);

    atualizarTelas();

}

async function excluirReceita(indice){

    if(!confirm("Deseja excluir esta receita?")){
        return;
    }

    receitas.splice(indice, 1);

    await salvarReceitasFirebase(receitas);

    atualizarTelas();

}

async function excluirParcelamentoCompleto(indice){

    const despesa =
        despesas[indice];

    if(!despesa.grupoParcelamento){

        alert("Esta despesa não pertence a um parcelamento.");
        return;

    }

    if(
        !confirm(
            `Excluir todas as parcelas de "${despesa.descricao}"?`
        )
    ){
        return;
    }

    despesas = despesas.filter(
        item =>
            item.grupoParcelamento !== despesa.grupoParcelamento
    );

    await salvarDespesasFirebase(despesas);

    atualizarTelas();

}


// ==========================
// DATAS / TELAS
// ==========================

function formatarData(data){

    if(!data) return "";

    const partes =
        data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

function atualizarTelas(){

    atualizarFiltroMes();

    renderizar();

    renderizarDespesas();

    renderizarReceitas();

    renderizarParcelas();

    renderizarArquivados();

    renderizarMetas();

    atualizarResumo();

    atualizarParcelas();

    atualizarTituloMes();

    pesquisarLancamentos();

}

function limparUndefined(obj){

    return JSON.parse(
        JSON.stringify(obj)
    );

}

async function salvarTudoFirebase(){

    await Promise.all([
        salvarDespesasFirebase(despesas),
        salvarReceitasFirebase(receitas),
        salvarMetasFirebase(metas),
        salvarMesesArquivadosFirebase(mesesArquivados)
    ]);

}


// ==========================
// NAVEGAÇÃO
// ==========================

const paginaHome =
    document.getElementById("pagina-home");

const paginaDespesas =
    document.getElementById("pagina-despesas");

const paginaReceitas =
    document.getElementById("pagina-receitas");

const paginaParcelas =
    document.getElementById("pagina-parcelas");

const paginaArquivados =
    document.getElementById("pagina-arquivados");

function esconderTudo(){

    paginaHome.style.display = "none";
    paginaDespesas.style.display = "none";
    paginaReceitas.style.display = "none";
    paginaParcelas.style.display = "none";
    paginaArquivados.style.display = "none";
    paginaConfig.style.display = "none";

}

document.getElementById("btnHome").onclick = () => {

    esconderTudo();

    paginaHome.style.display = "block";

};

document.getElementById("btnDespesas").onclick = () => {

    esconderTudo();

    paginaDespesas.style.display = "block";

};

document.getElementById("btnReceitas").onclick = () => {

    esconderTudo();

    paginaReceitas.style.display = "block";

};

document.getElementById("btnParcelas").onclick = () => {

    esconderTudo();

    paginaParcelas.style.display = "block";

};

document.getElementById("btnArquivados").onclick = () => {

    esconderTudo();

    paginaArquivados.style.display = "block";

    renderizarArquivados();

};

document.getElementById("btnConfig").onclick = () => {

    esconderTudo();

    paginaConfig.style.display = "block";

};


// ==========================
// EVENTOS DOS FILTROS
// ==========================

const filtroMes =
    document.getElementById("filtroMes");

if(filtroMes){

    filtroMes.addEventListener(
        "change",
        atualizarTelas
    );

}

const filtroStatusSelect =
    document.getElementById("filtroStatus");

if(filtroStatusSelect){

    filtroStatusSelect.addEventListener(
        "change",
        atualizarTelas
    );

}

function atualizarTituloMes(){

    const filtro =
        document.getElementById("filtroMes");

    const titulo =
        document.getElementById("mesAtual");

    if(!filtro || !titulo) return;

    if(filtro.value === "todos"){

        titulo.textContent =
            "Todos os meses 🌷";

    } else {

        titulo.textContent =
            nomeMes(filtro.value) + " 🌷";

    }

}

const btnNovaMeta =
    document.getElementById("btnNovaMeta");

const modalMeta =
    document.getElementById("modalMeta");

const cancelarMeta =
    document.getElementById("cancelarMeta");

const salvarMeta =
    document.getElementById("salvarMeta");

btnNovaMeta.onclick = () => {

    indiceMetaEditando = null;

    document.getElementById("nomeMeta").value = "";
    document.getElementById("valorObjetivo").value = "";
    document.getElementById("valorAtualMeta").value = "";

    modalMeta.style.display = "flex";

};

cancelarMeta.onclick = () => {

    modalMeta.style.display = "none";

};

salvarMeta.onclick = async () => {

    const nome =
        document.getElementById("nomeMeta").value.trim();

    const objetivo =
        Number(
            document.getElementById("valorObjetivo").value
        );

    const atual =
        Number(
            document.getElementById("valorAtualMeta").value
        );

    if(!nome || !objetivo || objetivo <= 0 || atual < 0){

        alert("Preencha nome, objetivo e valor guardado da meta.");
        return;

    }

    if(indiceMetaEditando !== null){

        metas[indiceMetaEditando] = {
            nome,
            objetivo,
            atual
        };

        indiceMetaEditando = null;

    } else {

        metas.push({
            nome,
            objetivo,
            atual
        });

    }

    await salvarMetasFirebase(metas);

    atualizarTelas();

    modalMeta.style.display = "none";

    document.getElementById("nomeMeta").value = "";
    document.getElementById("valorObjetivo").value = "";
    document.getElementById("valorAtualMeta").value = "";

    indiceMetaEditando = null;

};

function renderizarMetas(){

    const listaMetas =
        document.getElementById("lista-metas");

    listaMetas.innerHTML = "";

    metas.forEach(meta => {

        const porcentagem =
            Math.min(
                meta.objetivo > 0
                    ? (meta.atual / meta.objetivo) * 100
                    : 0,
                100
            );

        listaMetas.innerHTML += `
            <div class="meta-financeira">

                <strong>🎯 ${meta.nome}</strong>

                <br><br>

                R$ ${meta.atual.toLocaleString("pt-BR")}
                /
                R$ ${meta.objetivo.toLocaleString("pt-BR")}

                <br><br>

                <strong>${porcentagem.toFixed(1)}%</strong>

                <div class="barra-meta">

                    <div
                        class="progresso-meta"
                        style="width:${porcentagem}%">
                    </div>

                </div>

                <br>

                <button
                    class="btn-excluir"
                    onclick="excluirMeta(${metas.indexOf(meta)})">
                    🗑️ Excluir
                </button>

                <button
                    class="btn-editar"
                    onclick="editarMeta(${metas.indexOf(meta)})">
                    ✏️ Editar
                </button>

            </div>
        `;

    });

}

async function excluirMeta(indice){

    if(!confirm("Deseja excluir esta meta?")){
        return;
    }

    metas.splice(indice, 1);

    await salvarMetasFirebase(metas);

    atualizarTelas();

}

function editarMeta(indice){

    const meta =
        metas[indice];

    document.getElementById("nomeMeta").value =
        meta.nome;

    document.getElementById("valorObjetivo").value =
        meta.objetivo;

    document.getElementById("valorAtualMeta").value =
        meta.atual;

    indiceMetaEditando = indice;

    modalMeta.style.display = "flex";

}


// ==========================
// EDITAR DESPESA / RECEITA
// ==========================

function editarDespesa(indice){

    const despesa =
        despesas[indice];

    document.getElementById("descricao").value =
        despesa.descricao;

    document.getElementById("valor").value =
        despesa.valor;

    document.getElementById("categoria").value =
        despesa.categoria;

    document.getElementById("data").value =
        despesa.data;

    document.getElementById("parcelado").checked =
        despesa.ehParcelado;

    document.getElementById("parcelaAtual").value =
        despesa.parcelaAtual || "";

    document.getElementById("totalParcelas").value =
        despesa.totalParcelas || "";

    campoParcelas.style.display =
        despesa.ehParcelado ? "flex" : "none";

    indiceDespesaEditando = indice;

    modalDespesa.style.display = "flex";

}

function editarReceita(indice){

    const receita =
        receitas[indice];

    document.getElementById("descricaoReceita").value =
        receita.descricao;

    document.getElementById("valorReceita").value =
        receita.valor;

    document.getElementById("dataReceita").value =
        receita.data;

    document.getElementById("receitaFixa").checked =
        !!receita.grupoReceitaFixa;

    indiceReceitaEditando = indice;

    modalReceita.style.display = "flex";

}

// ==========================
// RENDERIZAR DESPESAS
// ==========================

function renderizarDespesas(){

    const listaDespesas =
        document.getElementById("lista-despesas");

    const filtroSelecionado =
        document.getElementById("filtroMes")?.value || "todos";

    listaDespesas.innerHTML = "";

    despesas
        .map((item, indice) => ({
            ...item,
            indice
        }))
        .filter(item => {

            if(item.ehParcelado){
                return false;
            }

            if(!passaFiltroMes(item, filtroSelecionado)){
                return false;
            }

            return passaFiltroStatus(item);

        })
        .slice()
        .reverse()
        .forEach(item => {

            listaDespesas.innerHTML += `
                <div class="meta-financeira">

                    <strong>💸 ${item.descricao}</strong>

                    <br><br>

                    R$ ${Number(item.valor).toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits:2
                        }
                    )}

                    <br>

                    📅 ${formatarData(item.data)}

                    ${item.pago ? `
                        <br>
                        <br>
                        <span class="selo-pago">
                            ✅ Pago
                        </span>
                    ` : ""}

                    <br><br>

                    <button
                        class="btn-editar"
                        onclick="editarDespesa(${item.indice})">
                        ✏️ Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirDespesa(${item.indice})">
                        🗑️ Excluir
                    </button>

                    <button
                        class="${item.pago ? 'btn-desfazer' : 'btn-pago'}"
                        onclick="alternarPagamento(${item.indice})">
                        ${item.pago ? "↩️ Desfazer" : "✅ Pago"}
                    </button>

                </div>
            `;

        });

}


// ==========================
// RENDERIZAR RECEITAS
// ==========================

function renderizarReceitas(){

    const listaReceitas =
        document.getElementById("lista-receitas");

    const filtroSelecionado =
        document.getElementById("filtroMes")?.value || "todos";

    listaReceitas.innerHTML = "";

    receitas
        .map((item, indice) => ({
            ...item,
            indice
        }))
        .filter(item => {

            return passaFiltroMes(item, filtroSelecionado);

        })
        .slice()
        .reverse()
        .forEach(item => {

            listaReceitas.innerHTML += `
                <div class="meta-financeira">

                    <strong>💰 ${item.descricao}</strong>

                    <br><br>

                    R$ ${Number(item.valor).toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits:2
                        }
                    )}

                    <br>

                    📅 ${formatarData(item.data)}

                    <br><br>

                    <button
                        class="btn-editar"
                        onclick="editarReceita(${item.indice})">
                        ✏️ Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirReceita(${item.indice})">
                        🗑️ Excluir
                    </button>

                </div>
            `;

        });

}


// ==========================
// RENDERIZAR PARCELAS
// ==========================

function renderizarParcelas(){

    const listaParcelas =
        document.getElementById("lista-parcelas");

    const filtroSelecionado =
        document.getElementById("filtroMes")?.value || "todos";

    listaParcelas.innerHTML = "";

    despesas
        .map((item, indice) => ({
            ...item,
            indice
        }))
        .filter(item => {

            if(!item.ehParcelado){
                return false;
            }

            if(!passaFiltroMes(item, filtroSelecionado)){
                return false;
            }

            return passaFiltroStatus(item);

        })
        .slice()
        .reverse()
        .forEach(item => {

            listaParcelas.innerHTML += `
                <div class="meta-financeira">

                    <strong>
                        📦 ${item.descricao}
                    </strong>

                    <br><br>

                    R$ ${Number(item.valor).toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits:2
                        }
                    )}

                    <br>

                    Parcela
                    ${item.parcelaAtual}/${item.totalParcelas}

                    <br>

                    📅 ${formatarData(item.data)}

                    ${item.pago ? `
                        <br>
                        <br>
                        <span class="selo-pago">
                            ✅ Pago
                        </span>
                    ` : ""}

                    <br><br>

                    <button
                        class="btn-editar"
                        onclick="editarDespesa(${item.indice})">
                        ✏️ Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirDespesa(${item.indice})">
                        🗑️ Excluir
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirParcelamentoCompleto(${item.indice})">
                        📦 Excluir Parcelas
                    </button>

                    <button
                        class="${item.pago ? 'btn-desfazer' : 'btn-pago'}"
                        onclick="alternarPagamento(${item.indice})">
                        ${item.pago ? "↩️ Desfazer" : "✅ Pago"}
                    </button>

                </div>
            `;

        });

    if(listaParcelas.innerHTML === ""){

        listaParcelas.innerHTML = `
            <div class="meta-financeira">
                Nenhuma compra parcelada encontrada.
            </div>
        `;

    }

}

// ==========================
// MESES ARQUIVADOS
// ==========================

function obterLancamentosDoMes(mesAno){

    const lancamentos =
        [];

    despesas.forEach((item, indice) => {

        if(obterMesAno(item.data) === mesAno){

            lancamentos.push({
                tipo: "despesa",
                indice,
                ...item
            });

        }

    });

    receitas.forEach((item, indice) => {

        if(obterMesAno(item.data) === mesAno){

            lancamentos.push({
                tipo: "receita",
                indice,
                ...item
            });

        }

    });

    return lancamentos.sort(
        (a, b) =>
            String(b.data || "")
                .localeCompare(String(a.data || ""))
    );

}

function renderizarArquivados(){

    const listaArquivados =
        document.getElementById("lista-arquivados");

    if(!listaArquivados){
        return;
    }

    listaArquivados.innerHTML = "";

    const meses =
        normalizarMesesArquivados(mesesArquivados)
            .filter(Boolean)
            .sort()
            .reverse();

    if(meses.length === 0){

        listaArquivados.innerHTML = `
            <div class="meta-financeira">
                Nenhum mês arquivado ainda.
            </div>
        `;

        return;

    }

    meses.forEach(mesAno => {

        const lancamentos =
            obterLancamentosDoMes(mesAno);

        const totalReceitas =
            lancamentos
                .filter(item => item.tipo === "receita")
                .reduce(
                    (total, item) =>
                        total + Number(item.valor),
                    0
                );

        const totalDespesas =
            lancamentos
                .filter(item => item.tipo === "despesa")
                .reduce(
                    (total, item) =>
                        total + Number(item.valor),
                    0
                );

        const saldo =
            totalReceitas - totalDespesas;

        const itensHtml =
            lancamentos.length > 0
                ? lancamentos.map(item => {

                    const valor =
                        Number(item.valor).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL"
                            }
                        );

                    const parcela =
                        item.tipo === "despesa" &&
                        item.ehParcelado &&
                        item.parcelaAtual &&
                        item.totalParcelas
                            ? ` - Parcela ${item.parcelaAtual}/${item.totalParcelas}`
                            : "";

                    const pago =
                        item.tipo === "despesa" && item.pago
                            ? " - Pago"
                            : "";

                    return `
                        <li>
                            ${item.tipo === "despesa" ? "💸" : "💰"}
                            ${item.descricao || "Sem descrição"}
                            - ${valor}
                            ${parcela}
                            ${pago}
                        </li>
                    `;

                }).join("")
                : "<li>Nenhum lançamento encontrado neste mês.</li>";

        listaArquivados.innerHTML += `
            <div class="meta-financeira mes-arquivado">

                <strong>🗃️ ${nomeMes(mesAno)}</strong>

                <div class="resumo-arquivado">
                    <span>Receitas: ${totalReceitas.toLocaleString("pt-BR", { style:"currency", currency:"BRL" })}</span>
                    <span>Despesas: ${totalDespesas.toLocaleString("pt-BR", { style:"currency", currency:"BRL" })}</span>
                    <span>Saldo: ${saldo.toLocaleString("pt-BR", { style:"currency", currency:"BRL" })}</span>
                </div>

                <ul class="lista-itens-arquivados">
                    ${itensHtml}
                </ul>

                <button
                    class="btn-editar"
                    onclick="restaurarMesArquivado('${mesAno}')">
                    ↩️ Restaurar mês
                </button>

            </div>
        `;

    });

}

async function arquivarMesSelecionado(){

    const select =
        document.getElementById("filtroMes");

    const mesSelecionado =
        select?.value || "todos";

    if(mesSelecionado === "todos"){

        alert("Selecione um mês específico antes de arquivar.");
        return;

    }

    if(!obterMesesComRegistros().includes(mesSelecionado)){

        alert("Este mês não possui lançamentos para arquivar.");
        return;

    }

    if(
        !confirm(
            `Arquivar ${nomeMes(mesSelecionado)}? Ele sairá das telas principais e ficará em Meses Arquivados.`
        )
    ){
        return;
    }

    if(!mesEstaArquivado(mesSelecionado)){

        mesesArquivados.push(mesSelecionado);
        mesesArquivados =
            normalizarMesesArquivados(mesesArquivados);

    }

    await salvarMesesArquivadosFirebase(mesesArquivados);

    atualizarTelas();

    alert("Mês arquivado com sucesso!");

}

async function restaurarMesArquivado(mesAno){

    if(
        !confirm(
            `Restaurar ${nomeMes(mesAno)} para as telas principais?`
        )
    ){
        return;
    }

    mesesArquivados =
        mesesArquivados.filter(
            mes => mes !== mesAno
        );

    await salvarMesesArquivadosFirebase(mesesArquivados);

    atualizarTelas();

    alert("Mês restaurado com sucesso!");

}

// ==========================
// CONFIGURAÇÕES
// ==========================

document.getElementById("btnArquivarMes")
.onclick = arquivarMesSelecionado;

const btnArquivarMesHome =
    document.getElementById("btnArquivarMesHome");

if(btnArquivarMesHome){

    btnArquivarMesHome.onclick =
        arquivarMesSelecionado;

}

document.getElementById("btnLimparDespesas")
.onclick = async () => {

    if(!confirm("Deseja apagar TODAS as despesas?")){
        return;
    }

    ultimoBackup = {
        despesas: [...despesas],
        receitas: [...receitas],
        metas: [...metas],
        mesesArquivados: [...mesesArquivados]
    };

    despesas = [];

    await salvarDespesasFirebase(despesas);

    atualizarTelas();

};

document.getElementById("btnLimparReceitas")
.onclick = async () => {

    if(!confirm("Deseja apagar TODAS as receitas?")){
        return;
    }

    ultimoBackup = {
        despesas: [...despesas],
        receitas: [...receitas],
        metas: [...metas],
        mesesArquivados: [...mesesArquivados]
    };

    receitas = [];

    await salvarReceitasFirebase(receitas);

    atualizarTelas();

};

document.getElementById("btnLimparMetas")
.onclick = async () => {

    if(!confirm("Deseja apagar TODAS as metas?")){
        return;
    }

    ultimoBackup = {
        despesas: [...despesas],
        receitas: [...receitas],
        metas: [...metas],
        mesesArquivados: [...mesesArquivados]
    };

    metas = [];

    await salvarMetasFirebase(metas);

    atualizarTelas();

};

document.getElementById("btnDesfazer")
.onclick = async () => {

    if(!ultimoBackup){

        alert("Nenhuma limpeza para desfazer.");
        return;

    }

    despesas = ultimoBackup.despesas;
    receitas = ultimoBackup.receitas;
    metas = ultimoBackup.metas;
    mesesArquivados =
        normalizarMesesArquivados(
            ultimoBackup.mesesArquivados || []
        );

    await salvarTudoFirebase();

    atualizarTelas();

    alert("Dados restaurados com sucesso!");

};

document.getElementById("btnExportar")
.onclick = () => {

    const backup = {
        despesas,
        receitas,
        metas,
        mesesArquivados
    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "financeiro-backup.json";

    link.click();

};

document.getElementById("btnImportar")
.onclick = () => {

    document
        .getElementById("arquivoBackup")
        .click();

};

document.getElementById("arquivoBackup")
.addEventListener("change", (evento) => {

    const arquivo =
        evento.target.files[0];

    if(!arquivo){
        return;
    }

    const leitor =
        new FileReader();

    leitor.onload = async (e) => {

        try{

            const backup =
                JSON.parse(e.target.result);

            if(
                !backup.despesas ||
                !backup.receitas ||
                !backup.metas
            ){
                throw new Error();
            }

            if(
                !confirm(
                    "Importar este backup substituirá os dados atuais. Continuar?"
                )
            ){
                return;
            }

            despesas = backup.despesas;
            receitas = backup.receitas;
            metas = backup.metas;
            mesesArquivados =
                normalizarMesesArquivados(
                    backup.mesesArquivados || []
                );

            await salvarTudoFirebase();

            atualizarTelas();

            alert("Backup importado com sucesso!");

        } catch{

            alert("Arquivo inválido.");

        }

    };

    leitor.readAsText(arquivo);

});


// ==========================
// TEMA
// ==========================

const temaSelect =
    document.getElementById("temaSelect");

temaSelect.value =
    localStorage.getItem("tema") || "claro";

aplicarTema(temaSelect.value);

temaSelect.addEventListener("change", () => {

    aplicarTema(temaSelect.value);

});

function aplicarTema(tema){

    document.body.classList.remove("tema-escuro");

    if(tema === "escuro"){

        document.body.classList.add("tema-escuro");

    }

    localStorage.setItem("tema", tema);

}


// ==========================
// LOGIN
// ==========================

const telaLogin =
    document.getElementById("telaLogin");

const app =
    document.getElementById("app");

const btnEntrar =
    document.getElementById("btnEntrar");

const senhaLogin =
    document.getElementById("senhaLogin");

const erroLogin =
    document.getElementById("erroLogin");

if(localStorage.getItem("autenticado") === "sim"){

    telaLogin.style.display = "none";
    app.style.display = "block";

}

btnEntrar.onclick = () => {

    if(senhaLogin.value === SENHA){

        localStorage.setItem("autenticado", "sim");

        telaLogin.style.display = "none";
        app.style.display = "block";

    } else {

        erroLogin.textContent =
            "Senha incorreta.";

        senhaLogin.value = "";

    }

};

senhaLogin.addEventListener("keypress", e => {

    if(e.key === "Enter"){

        btnEntrar.click();

    }

});

document.getElementById("btnSair").onclick = () => {

    localStorage.removeItem("autenticado");

    location.reload();

};


// ==========================
// ALTERAR SENHA
// ==========================

const btnTrocarSenha =
    document.getElementById("btnTrocarSenha");

const modalSenha =
    document.getElementById("modalSenha");

const cancelarSenha =
    document.getElementById("cancelarSenha");

const salvarSenha =
    document.getElementById("salvarSenha");

btnTrocarSenha.onclick = () => {

    modalSenha.style.display = "flex";

};

cancelarSenha.onclick = () => {

    modalSenha.style.display = "none";

};

salvarSenha.onclick = async () => {

    const senhaAtual =
        document.getElementById("senhaAtual").value;

    const novaSenha =
        document.getElementById("novaSenha").value;

    const confirmarSenha =
        document.getElementById("confirmarSenha").value;

    if(senhaAtual !== SENHA){

        alert("Senha atual incorreta.");
        return;

    }

    if(novaSenha.length < 4){

        alert("A nova senha deve ter pelo menos 4 caracteres.");
        return;

    }

    if(novaSenha !== confirmarSenha){

        alert("As senhas não coincidem.");
        return;

    }

    await salvarSenhaFirebase(novaSenha);

    SENHA = novaSenha;

    localStorage.setItem(
        "senhaFinanceiro",
        novaSenha
    );

    alert("Senha alterada com sucesso!");

    modalSenha.style.display = "none";

    document.getElementById("senhaAtual").value = "";
    document.getElementById("novaSenha").value = "";
    document.getElementById("confirmarSenha").value = "";

};


// ==========================
// FIREBASE
// ==========================

async function carregarDadosFirebase(){

    try{

        despesas =
            await carregarDespesasFirebase();

        receitas =
            await carregarReceitasFirebase();

        metas =
            await carregarMetasFirebase();

        mesesArquivados =
            normalizarMesesArquivados(
                await carregarMesesArquivadosFirebase()
            );

    } catch(erro){

        console.error(
            "Erro ao carregar Firebase:",
            erro
        );

    }

}

async function carregarSenha(){

    SENHA =
        await carregarSenhaFirebase();

}

async function alternarPagamento(indice){

    despesas[indice].pago =
        !despesas[indice].pago;

    await salvarDespesasFirebase(despesas);

    atualizarTelas();

}

// ==========================
// PESQUISA
// ==========================

const campoPesquisa =
    document.getElementById("pesquisaLancamentos");

const resultadoPesquisa =
    document.getElementById("resultadoPesquisa");

if(campoPesquisa){

    campoPesquisa.addEventListener(
        "input",
        pesquisarLancamentos
    );

}

function pesquisarLancamentos(){

    if(!campoPesquisa || !resultadoPesquisa){
        return;
    }

    const texto =
        campoPesquisa.value
            .toLowerCase()
            .trim();

    resultadoPesquisa.innerHTML = "";

    if(texto === ""){
        return;
    }

    const filtroSelecionado =
        document.getElementById("filtroMes")?.value || "todos";

    const filtroStatus =
        obterFiltroStatus();

    const resultados = [];

    despesas.forEach((item, indice) => {

        if(
            String(item.descricao || "").toLowerCase().includes(texto) &&
            passaFiltroMes(item, filtroSelecionado) &&
            passaFiltroStatus(item)
        ){

            resultados.push({
                tipo: "despesa",
                indice: indice,
                ...item
            });

        }

    });

    if(filtroStatus === "todos"){

        receitas.forEach((item, indice) => {

            if(
                String(item.descricao || "").toLowerCase().includes(texto) &&
                passaFiltroMes(item, filtroSelecionado)
            ){

                resultados.push({
                    tipo: "receita",
                    indice: indice,
                    ...item
                });

            }

        });

    }

    resultados.sort((a, b) => {
        return String(b.data || "")
            .localeCompare(String(a.data || ""));
    });

    if(resultados.length === 0){

        resultadoPesquisa.innerHTML = `
            <div class="resultado-pesquisa">
                Nenhum lançamento encontrado neste filtro.
            </div>
        `;

        return;

    }

    resultados.forEach(item => {

        const valorFormatado =
            Number(item.valor).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        const parcelaTexto =
    item.tipo === "despesa" &&
    item.ehParcelado &&
    item.parcelaAtual &&
    item.totalParcelas
        ? `<br>📦 Parcela ${item.parcelaAtual}/${item.totalParcelas}`
        : "";

const categoriaTexto =
    item.tipo === "despesa" && item.categoria
        ? `<br>🏷️ ${item.categoria}`
        : "";

        const pagoTexto =
            item.tipo === "despesa" && item.pago
                ? `
                    <br><br>
                    <span class="selo-pago">
                        ✅ Pago
                    </span>
                `
                : "";

        let botoes = "";

        if(item.tipo === "despesa"){

            botoes = `
                <button
                    class="btn-editar"
                    onclick="editarDespesa(${item.indice})">
                    ✏️ Editar
                </button>

                <button
                    class="btn-excluir"
                    onclick="excluirDespesa(${item.indice})">
                    🗑️ Excluir
                </button>

                ${item.grupoParcelamento ? `
                    <button
                        class="btn-excluir"
                        onclick="excluirParcelamentoCompleto(${item.indice})">
                        📦 Excluir Parcelas
                    </button>
                ` : ""}

                <button
                    class="${item.pago ? "btn-desfazer" : "btn-pago"}"
                    onclick="alternarPagamento(${item.indice})">
                    ${item.pago ? "↩️ Desfazer" : "✅ Pago"}
                </button>
            `;

        } else {

            botoes = `
                <button
                    class="btn-editar"
                    onclick="editarReceita(${item.indice})">
                    ✏️ Editar
                </button>

                <button
                    class="btn-excluir"
                    onclick="excluirReceita(${item.indice})">
                    🗑️ Excluir
                </button>
            `;

        }

        resultadoPesquisa.innerHTML += `
            <div class="resultado-pesquisa">

                <strong>
                    ${item.tipo === "despesa" ? "💸" : "💰"}
                    ${item.descricao || "Sem descrição"}
                </strong>

                <br>

                ${valorFormatado}

                ${categoriaTexto}

                ${parcelaTexto}

                <br>

                📅 ${formatarData(item.data)}

                ${pagoTexto}

                <div class="acoes-resultado-pesquisa">
                    ${botoes}
                </div>

            </div>
        `;

    });

}


// ==========================
// INICIALIZAÇÃO
// ==========================

async function inicializarSistema(){

    await carregarSenha();

    await carregarDadosFirebase();

    atualizarTelas();

}

inicializarSistema();
