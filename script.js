let SENHA = "Flora2026";

// ==========================
// DADOS
// ==========================

let despesas = [];

let receitas = [];

let metas = [];

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
    Number(document.getElementById("totalParcelas").value) || "";

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

    // Se for parcelamento
    if(despesaOriginal.grupoParcelamento){

        const grupo =
            despesaOriginal.grupoParcelamento;

        // Remove todas as parcelas antigas
        despesas = despesas.filter(
            item =>
                item.grupoParcelamento !== grupo
        );

        const [ano, mes, dia] =
    data.split("-");

const dataBase =
    new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
    );

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

    const ano =
        novaData.getFullYear();

    const mes =
        String(
            novaData.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            novaData.getDate()
        ).padStart(2, "0");

    despesas.push({

        descricao,

        valor,

        categoria,

        data:
            `${ano}-${mes}-${dia}`,

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

            parcelaAtual,

            totalParcelas,

            grupoParcelamento:
                despesas[indiceDespesaEditando]
                .grupoParcelamento,

            pago:
                despesas[indiceDespesaEditando]
                .pago

        };

    

    indiceDespesaEditando = null;

}

} else {

    if(ehParcelado){

    const [ano, mes, dia] =
    data.split("-");

const dataBase =
    new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
    );

    const grupoParcelamento = Date.now();

    for(
        let parcela = Number(parcelaAtual);
        parcela <= Number(totalParcelas);
        parcela++
    ){

        const novaData = new Date(dataBase);

        novaData.setMonth(
            dataBase.getMonth() +
            (parcela - Number(parcelaAtual))
        );

        despesas.push({

            descricao,

            valor,

            categoria,

            data:
                novaData
                    .toISOString()
                    .split("T")[0],

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

    await salvarDespesasFirebase(despesas);
    
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

    if(!descricao || !valor || valor <= 0 || !data){
        alert("Preencha descrição, valor e data da receita.");
        return;
    }

    if(indiceReceitaEditando !== null){

    receitas[indiceReceitaEditando] = {
        descricao,
        valor,
        data
    };

    indiceReceitaEditando = null;

} else {

    receitas.push({
        descricao,
        valor,
        data
    });

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

}


// ==========================
// LANÇAMENTOS
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

    if(lancamentos.length === 0){

        lista.innerHTML =
            "<p>Nenhum lançamento ainda.</p>";

        return;
    }

    const filtroMes =
    document.getElementById("filtroMes")?.value || "todos";

const lancamentosFiltrados =
    lancamentos.filter(item => {

        if(filtroMes === "todos"){
            return true;
        }

        return obterMesAno(item.data) === filtroMes;

    });

lancamentosFiltrados.reverse();

lancamentosFiltrados.forEach(item => {

        if(item.tipo === "receita"){

            lista.innerHTML += `
                <div class="meta-financeira">
                    💰 ${item.descricao}
                    <br>
                    R$ ${Number(item.valor).toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits: 2
                        }
                    )}

                    <br>
                    📅 ${formatarData(item.data)}

                    ${item.pago ? `
                        <br>
                        <span class="selo-pago">
                            ✅ Pago
                    </span>
` : ""}

                    <br><br>

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
            `;

        } else {

            let parcelaTexto = "";

            if(
                item.ehParcelado &&
                item.parcelaAtual &&
                item.totalParcelas
            ){
                parcelaTexto =
                    `<br>📦 ${item.parcelaAtual}/${item.totalParcelas}`;
            }

            lista.innerHTML += `
    <div class="meta">
        💸 ${item.descricao}
        <br>

        R$ ${Number(item.valor).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2
            }
        )}

        ${parcelaTexto}

        <br>

        📅 ${formatarData(item.data)}

        ${item.pago ? `
            <br>
            <strong>✅ Pago</strong>
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
    🗑 Excluir
</button>

<button
    class="${item.pago ? 'btn-desfazer' : 'btn-pago'}"
    onclick="alternarPagamento(${item.indice})">
    ${item.pago ? "↩️ Desfazer" : "✅ Pago"}
</button>

                </div>
            `;
        }

    });

}

function obterMesAno(data){

    if(!data) return "";

    return data.substring(0, 7);

}

function nomeMes(mesAno){

    const [ano, mes] = mesAno.split("-");

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

    return `${meses[Number(mes)-1]} ${ano}`;

}

function atualizarFiltroMes(){

    const select =
        document.getElementById("filtroMes");

    if(!select) return;

    const meses = new Set();

    despesas.forEach(item => {
        meses.add(obterMesAno(item.data));
    });

    receitas.forEach(item => {
        meses.add(obterMesAno(item.data));
    });

    const valorAtual = select.value;

    select.innerHTML = `
        <option value="todos">
            Todos os meses
        </option>
    `;

    [...meses]
        .sort()
        .reverse()
        .forEach(mes => {

            select.innerHTML += `
                <option value="${mes}">
                    ${nomeMes(mes)}
                </option>
            `;

        });

    if(valorAtual){
        select.value = valorAtual;
    }

}


// ==========================
// RESUMO
// ==========================

function atualizarResumo(){

    const filtroMes =
        document.getElementById("filtroMes")?.value || "todos";

    const despesasFiltradas =
        despesas.filter(item => {

            if(filtroMes === "todos"){
                return true;
            }

            return obterMesAno(item.data) === filtroMes;

        });

    const receitasFiltradas =
        receitas.filter(item => {

            if(filtroMes === "todos"){
                return true;
            }

            return obterMesAno(item.data) === filtroMes;

        });

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
// PARCELAS
// ==========================

function atualizarParcelas(){

    const parcelasAtivas =
        despesas.filter(
            item => item.ehParcelado
        ).length;

    document.querySelector(".parcelas span")
        .textContent =
        parcelasAtivas;

}

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

    const despesa = despesas[indice];

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
            item.grupoParcelamento !==
            despesa.grupoParcelamento
    );

    await salvarDespesasFirebase(despesas);

    atualizarTelas();

}

function formatarData(data){

    if(!data) return "";

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

function atualizarTelas(){

    atualizarFiltroMes();
    renderizar();
    renderizarDespesas();
    renderizarReceitas();
    renderizarParcelas();
    renderizarMetas();
    atualizarResumo();
    atualizarParcelas();
    atualizarTituloMes();

}

async function salvarTudoFirebase(){

    await Promise.all([
        salvarDespesasFirebase(despesas),
        salvarReceitasFirebase(receitas),
        salvarMetasFirebase(metas)
    ]);

}

const paginaHome =
document.getElementById("pagina-home");

const paginaDespesas =
document.getElementById("pagina-despesas");

const paginaReceitas =
document.getElementById("pagina-receitas");

const paginaParcelas =
document.getElementById("pagina-parcelas");

function esconderTudo(){

    paginaHome.style.display = "none";
    paginaDespesas.style.display = "none";
    paginaReceitas.style.display = "none";
    paginaParcelas.style.display = "none";
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

document.getElementById("btnConfig").onclick = () => {

    esconderTudo();

    paginaConfig.style.display = "block";

};

const filtroMes =
    document.getElementById("filtroMes");

if(filtroMes){

    filtroMes.addEventListener("change", () => {

    renderizar();

    renderizarDespesas();

    renderizarReceitas();
    
    atualizarResumo();

    atualizarTituloMes();

    renderizarParcelas();

});

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

// ==========================
// METAS
// ==========================

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
                    🗑 Excluir
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

renderizarMetas();

}

function editarMeta(indice){

    const meta = metas[indice];

    document.getElementById("nomeMeta").value =
        meta.nome;

    document.getElementById("valorObjetivo").value =
        meta.objetivo;

    document.getElementById("valorAtualMeta").value =
        meta.atual;

    indiceMetaEditando = indice;

    modalMeta.style.display = "flex";

}

function editarDespesa(indice){

    const despesa = despesas[indice];

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

    const receita = receitas[indice];

    document.getElementById("descricaoReceita").value =
        receita.descricao;

    document.getElementById("valorReceita").value =
        receita.valor;

    document.getElementById("dataReceita").value =
        receita.data;

    indiceReceitaEditando = indice;

    modalReceita.style.display = "flex";

}

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

        if(filtroSelecionado === "todos"){
            return true;
        }

        return obterMesAno(item.data) === filtroSelecionado;

    })
    .slice()
    .reverse()
    .forEach((item) => {

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

                    <br><br>

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
            `;

        });

}

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

            if(filtroSelecionado === "todos"){
                return true;
            }

            return obterMesAno(item.data) === filtroSelecionado;

        })
        .slice()
        .reverse()
        .forEach((item) => {

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
                        🗑 Excluir
                    </button>

                </div>
            `;

        });

}

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

            if(filtroSelecionado === "todos"){
                return true;
            }

            return (
                obterMesAno(item.data) ===
                filtroSelecionado
            );

        })
        .slice()
        .reverse()
        .forEach((item, indice) => {

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
                        🗑 Excluir
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

document.getElementById("btnLimparDespesas")
.onclick = async () => {

    if(!confirm(
        "Deseja apagar TODAS as despesas?"
    )){
        return;
    }

    ultimoBackup = {
    despesas: [...despesas],
    receitas: [...receitas],
    metas: [...metas]
};

    despesas = [];

    await salvarDespesasFirebase(despesas);

    atualizarTelas();

};

document.getElementById("btnLimparReceitas")
.onclick = async () => {

    if(!confirm(
        "Deseja apagar TODAS as receitas?"
    )){
        return;
    }

    ultimoBackup = {
    despesas: [...despesas],
    receitas: [...receitas],
    metas: [...metas]
};

    receitas = [];

    await salvarReceitasFirebase(receitas);

    atualizarTelas();

};

document.getElementById("btnLimparMetas")
.onclick = async () => {

    if(!confirm(
        "Deseja apagar TODAS as metas?"
    )){
        return;
    }

    ultimoBackup = {
    despesas: [...despesas],
    receitas: [...receitas],
    metas: [...metas]
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

    await salvarTudoFirebase();

    atualizarTelas();

    alert("Dados restaurados com sucesso!");

};

document.getElementById("btnExportar")
.onclick = () => {

    const backup = {
        despesas,
        receitas,
        metas
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

const temaSelect =
    document.getElementById("temaSelect");

temaSelect.value =
    localStorage.getItem("tema")
    || "claro";

aplicarTema(temaSelect.value);

temaSelect.addEventListener("change", () => {

    aplicarTema(temaSelect.value);

});

function aplicarTema(tema){

    document.body.classList.remove(
        "tema-escuro"
    );

    if(tema === "escuro"){

        document.body.classList.add(
            "tema-escuro"
        );

    }

    localStorage.setItem(
        "tema",
        tema
    );

}

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

            despesas =
                backup.despesas;

            receitas =
                backup.receitas;

            metas =
                backup.metas;

            await salvarTudoFirebase();

            atualizarTelas();

            alert(
                "Backup importado com sucesso!"
            );

        } catch{

            alert(
                "Arquivo inválido."
            );

        }

    };

    leitor.readAsText(arquivo);

});

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

    if(
        senhaLogin.value === SENHA
    ){

        localStorage.setItem(
            "autenticado",
            "sim"
        );

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

    localStorage.removeItem(
        "autenticado"
    );

    location.reload();

};

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

        alert(
            "A nova senha deve ter pelo menos 4 caracteres."
        );

        return;

    }

    if(novaSenha !== confirmarSenha){

        alert(
            "As senhas não coincidem."
        );

        return;

    }

    await salvarSenhaFirebase(novaSenha);

SENHA = novaSenha;

localStorage.setItem(
    "senhaFinanceiro",
    novaSenha
);

    alert(
        "Senha alterada com sucesso!"
    );

    modalSenha.style.display = "none";

    document.getElementById("senhaAtual").value = "";
    document.getElementById("novaSenha").value = "";
    document.getElementById("confirmarSenha").value = "";

};

async function carregarDadosFirebase(){

    try{

        despesas =
            await carregarDespesasFirebase();

        receitas =
            await carregarReceitasFirebase();

        metas =
            await carregarMetasFirebase();

    } catch(erro){

        console.error(
            "Erro ao carregar Firebase:",
            erro
        );

    }

}

async function carregarMetas(){

    try{

        metas =
            await carregarMetasFirebase();

        renderizarMetas();

    } catch(erro){

        console.error(
            "Erro ao carregar metas:",
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

    atualizarResumo();

    renderizar();
    renderizarDespesas();
    renderizarParcelas();

}

const campoPesquisa =
    document.getElementById("pesquisaLancamentos");

const resultadoPesquisa =
    document.getElementById("resultadoPesquisa");

campoPesquisa.addEventListener("input", pesquisarLancamentos);

function pesquisarLancamentos(){

    const texto =
        campoPesquisa.value
            .toLowerCase()
            .trim();

    resultadoPesquisa.innerHTML = "";

    if(texto === ""){
        return;
    }

    const resultados = [];

    despesas.forEach((item, indice)=>{

        if(
            item.descricao.toLowerCase().includes(texto)
        ){
            resultados.push({

                tipo:"despesa",
                indice,
                descricao:item.descricao,
                valor:item.valor

});

        }

    });

    receitas.forEach((item, indice)=>{

        if(
            item.descricao.toLowerCase().includes(texto)
        ){
            resultados.push({
                tipo:"receita",
                indice,
                descricao:item.descricao,
                valor:item.valor

});

        }

    });

    resultados.forEach(item=>{

        resultadoPesquisa.innerHTML += `
<div
    class="resultado-pesquisa"
    onclick="abrirResultado('${item.tipo}', ${item.indice})">

    
    <strong>
        ${item.tipo == "despesa" ? "💸" : "💰"}
        ${item.descricao}
    </strong>

    <br>

    R$ ${Number(item.valor).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2
        }
    )}

</div>
`;
    });

}

window.abrirResultado = function(tipo, indice){

    campoPesquisa.value = "";
    resultadoPesquisa.innerHTML = "";

    if(tipo === "despesa"){
        editarDespesa(indice);
        return;
    }

    editarReceita(indice);

};



// ==========================
// INICIALIZAÇÃO
// ==========================

async function inicializarSistema(){

    await carregarSenha();

    await carregarDadosFirebase();


    atualizarFiltroMes();

    renderizar();

    renderizarDespesas();

    renderizarReceitas();

    renderizarMetas();

    renderizarParcelas();

    atualizarResumo();

    atualizarParcelas();

    atualizarTituloMes();

}

inicializarSistema();
