import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyAMNwb_xKdXg325VZjRmfrZgwr4UTmeI5I",

    authDomain:
        "financeiro-babi-2026.firebaseapp.com",

    projectId:
        "financeiro-babi-2026",

    storageBucket:
        "financeiro-babi-2026.firebasestorage.app",

    messagingSenderId:
        "569764665363",

    appId:
        "1:569764665363:web:5db99761caf2ddefac87e6"

};

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);

window.db = db;
window.doc = doc;
window.getDoc = getDoc;
window.setDoc = setDoc;

window.salvarMetasFirebase = async function(metas){

    await setDoc(
        doc(db, "usuarios", "babi"),
        {
            metas: metas
        },
        {
            merge: true
        }
    );

};

window.carregarMetasFirebase = async function(){

    const documento =
        await getDoc(
            doc(db, "usuarios", "babi")
        );

    if(documento.exists()){

        return documento.data().metas || [];

    }

    return [];

};

// ==========================
// DESPESAS
// ==========================

window.salvarDespesasFirebase = async function(despesas){

    await setDoc(
        doc(db, "usuarios", "babi"),
        {
            despesas: despesas
        },
        {
            merge: true
        }
    );

};

window.carregarDespesasFirebase = async function(){

    const documento =
        await getDoc(
            doc(db, "usuarios", "babi")
        );

    if(documento.exists()){

        return documento.data().despesas || [];

    }

    return [];

};

// ==========================
// RECEITAS
// ==========================

window.salvarReceitasFirebase = async function(receitas){

    await setDoc(
        doc(db, "usuarios", "babi"),
        {
            receitas: receitas
        },
        {
            merge: true
        }
    );

};

window.carregarReceitasFirebase = async function(){

    const documento =
        await getDoc(
            doc(db, "usuarios", "babi")
        );

    if(documento.exists()){

        return documento.data().receitas || [];

    }

    return [];

};


// ==========================
// SENHA
// ==========================

window.salvarSenhaFirebase = async function(senha){

    await setDoc(
        doc(db, "usuarios", "babi"),
        {
            senha: senha
        },
        {
            merge: true
        }
    );

};

window.carregarSenhaFirebase = async function(){

    const documento =
        await getDoc(
            doc(db, "usuarios", "babi")
        );

    if(documento.exists()){

        return documento.data().senha || "Flora2026";

    }

    return "Flora2026";

};
