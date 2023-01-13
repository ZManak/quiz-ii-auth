
//firebase
const firebaseConfig = {
    apiKey: "AIzaSyBOsTuYeIMk21TURaxYK_fwOTUUaxOCRUU",
    authDomain: "puntuacion-quiz-ii.firebaseapp.com",
    projectId: "puntuacion-quiz-ii",
    storageBucket: "puntuacion-quiz-ii.appspot.com",
    messagingSenderId: "785165930933",
    appId: "1:785165930933:web:18fb6768a127c598f809fc"
};

firebase.initializeApp(firebaseConfig);// Inicializar app Firebase
const db = firebase.firestore();// db representa mi BBDD //inicia Firestore

let user = firebase.auth().currentUser

const lienzo = document.getElementsByClassName("pantalla_preguntas")[0]
const arrayPreguntas = [];
const arrayRespuestas = [];
let contador = 0
let aciertos = 0
let fecha = new Date().toLocaleDateString()
let userScore = {"puntuacion": 0, "fecha": fecha};

//SIGNUP
const signUpUser = (email, password) => {
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user;
            console.log(`se ha registrado ${user.email} ID:${user.uid}`)
            alert(`se ha registrado ${user.email} ID:${user.uid}`)
            // ...
            // Guarda El usuario en Firestore
            createUser({
                id: user.uid,
                email: user.email,
                puntuaciones: []
            });
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log("Error en el sistema" + error.message);
        });
};

//PASS1 = PASS2
document.getElementById("form1").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.email.value;
    let pass = event.target.elements.pass.value;
    let pass2 = event.target.elements.pass2.value;
    pass === pass2 ? signUpUser(email, pass) : alert("error password");
})

//SIGNIN - SIGNOUT
const signInUser = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user;
            console.log(`se ha logado ${user.email} ID:${user.uid}`)
            alert(`se ha logado ${user.email} ID:${user.uid}`)
            console.log("USER", user);
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode)
            console.log(errorMessage)
        });
}
const signOut = () => {
    let user = firebase.auth().currentUser;
    firebase.auth().signOut().then(() => {
        console.log("Sale del sistema: " + user.email)
    }).catch((error) => {
        console.log("hubo un error: " + error);
    });
}

//ANON
function anon () { 
    firebase.auth().signInAnonymously()
    .then(() => {
    console.log("Sesión anónima");
    alert("Sesión anónima. No se gurdarán puntuaciones")
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode)
    console.log(errorMessage)
  });
}

document.getElementById("form2").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.email2.value;
    let pass = event.target.elements.pass3.value;
    signInUser(email, pass)
})
document.getElementById("salir").addEventListener("click", ()=>{signOut()});
document.getElementById("anon").addEventListener("click", ()=>{anon()})

  
// Listener de usuario en el sistema
// Controlar usuario logado
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(`Está en el sistema:${user.email} ${user.uid}`);
    } else {
        console.log("no hay usuarios en el sistema");
    }
});

function subirPuntuacion(userId, userScore) {
    db.collection('users')
        .where('id', '==', userId)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                if (!doc.data().hasOwnProperty('puntuaciones')) {
                    doc.ref.update({ puntuaciones: [userScore] });
                } else {
                    doc.ref.update({ puntuaciones: doc.data().puntuaciones.concat(userScore) })
                }
                alert('Puntuación guardada')
            })
        });
};

//Guarda puntuaciones anónimas
/*const savePuntuacion = (puntuacion2) => {
    db.collection("puntuacion").add({
        puntuacion2
    })
        .then(function (docRef) {
            console.log("puntuacion añadida con la ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error añadiendo puntuacion", error);
        })
}*/

// saco en variables globales las puntuaciones
function sacarPuntuacion() {
    //const puntuacion2 = JSON.parse(localStorage.getItem("score"));
    const aciertosUser = aciertos;
    console.log(aciertosUser);
    console.log(fecha);
    userScore = {"puntuacion":aciertosUser, "fecha":fecha}
}

function subirPuntuacion(userID, userScore) {
    db.collection('users')
        .where('id', '==', userID)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                if (!doc.data().hasOwnProperty('puntuaciones')) {
                    doc.ref.update({ puntuaciones: [userScore] });
                } else {
                    doc.ref.update({ puntuaciones: doc.data().puntuaciones.concat(userScore) })
                }
                alert('Added to Score')
            })
        });
};

//const btnFinal = document.getElementById("btnFinal")
//btnFinal.addEventListener("click", () => (sacarPuntuacion(), subirPuntuacion(firebase.auth().currentUser.uid, userScore)))



// pintar preguntas

async function sacarPreguntas() {
    let resp = await fetch("https://opentdb.com/api.php?amount=10&type=multiple");
    let rawData = await resp.json();
    let listaPreguntas = rawData.results
    for (let i = 0; i < listaPreguntas.length; i++)
        arrayPreguntas.push(listaPreguntas[i])
}

function printQuestions(arrayPreguntas, lienzo) {

    for (let i = 0; i < arrayPreguntas.length; i++) {
        let tarjeta = document.createElement("div");
        tarjeta.setAttribute("class", "pregunta" + i);
        tarjeta.setAttribute("id", "pregunta" + i);
        const que = randomizar([arrayPreguntas[i].correct_answer, arrayPreguntas[i].incorrect_answers[0], arrayPreguntas[i].incorrect_answers[1], arrayPreguntas[i].incorrect_answers[2]])
        let q1 = que()
        let q2 = que()
        let q3 = que()
        let q4 = que()

        tarjeta.innerHTML =
            `<fieldset>
        <legend id=${i}>${i + 1} - ${arrayPreguntas[i].question}</legend>
        <div>
        <input class="pregunta" id="a${i}" type="radio" name=pregunta${i}" value=${q1.split(' ').join('')}>
        <label id=r${i}0 for="a${i}">${q1}</label>
        </div>
        <div>
        <input class="pregunta" id="b${i}" type="radio" name=pregunta${i}" value=${q2.split(' ').join('')}>
        <label id=r${i}1 for="b${i}">${q2}</label>
        </div>
        <div>
        <input class="pregunta" id="c${i}" type="radio" name=pregunta${i}" value=${q3.split(' ').join('')}>
        <label id=r${i}2 for="c${i}">${q3}</label>
        </div>
        <div>
        <input class="pregunta" id="d${i}" type="radio" name=pregunta${i}" value=${q4.split(' ').join('')}>
        <label id=r${i}3 for="d${i}">${q4}</label>
        </div>
        </fieldset >
        <article><button class="btnPreguntas${i} boton">SIGUIENTE PREGUNTA</button></article>`

        lienzo.appendChild(tarjeta);
    }
}

function activarBotones() {
    const botones = [];
    for (let i = 0; i <= 9; i++) {
        let boton = document.querySelector(`.btnPreguntas${i}`);
        botones.push(boton);

    }
    botones.forEach((element) => element.addEventListener("click", () => { rotar() }));
    // añadimos evento de al clickar el boton comenzar a jugar haga la funcion empezar.
    document.getElementById("botonEmpezar").addEventListener("click", () => { empezar() });
    document.getElementById("signUp").addEventListener("click", () => { empezar() })
}

function empezar() {
    const primeraPregunta = document.querySelector(".pregunta0");
    primeraPregunta.style.display = "block";

    const pantallaInicial = document.querySelector(".pantalla_inicial");
    pantallaInicial.style.display = "none";
}

function rotar() {
    if (contador === 9) {
        pantallaFinal();
    } else {
        ocultarPregunta(contador);
        mostrarPregunta(++contador);
    };
}

// funcion que muestra la pregunta
function mostrarPregunta(contador) {
    const pregunta = document.querySelector(".pregunta" + contador);
    pregunta.style.display = "block";
    contador++;
}

//funcion que oculta la pregunta
function ocultarPregunta(contador) {
    const pregunta = document.getElementById("pregunta" + contador);
    pregunta.style.display = "none";
}

function pantallaFinal() {
    let respuestas = document.querySelectorAll('input:checked')
    if (respuestas.length !== arrayPreguntas.length) {
        alert("No se respondieron todas.")
        location.reload(true)
    }
    for (let i = 0; i < arrayPreguntas.length; i++) {
        let chosen = respuestas[i].value
        arrayRespuestas.push(chosen)
    }

    validar();

    sacarPuntuacion();

    subirPuntuacion(firebase.auth().currentUser.uid, userScore);

    const pantallaFinal = document.querySelector(".pantalla_final");
    pantallaFinal.style.display = "block";

    let results = document.querySelector("#numCorrectas");
    results.innerHTML = `${aciertos}/10`

    const todasLasPantallasPreguntas = document.querySelectorAll(
        ".pantalla_preguntas"
    );
    todasLasPantallasPreguntas.forEach(
        (pantalla) => (pantalla.style.display = "none")
    );
}

function validar() {
    for (let i = 0; i < arrayPreguntas.length; i++) {
        if (arrayRespuestas[i] === arrayPreguntas[i].correct_answer.split(' ').join('')) {
            aciertos++
        }
    }
}

function randomizar(array) {
    let copia = Array.from(array); // Create a copy of input array
    return function () {
        if (copia.length < 1) { copia = Array.from(array); } // This line exist to create copy and make a new array from actual array whenever all possible options are selected once
        const index = Math.floor(Math.random() * copia.length); // Select an index randomly
        const item = copia[index]; // Get the index value
        copia.splice(index, 1); // Remove selected element from copied array
        return item; // Return selected element
    };
}

async function startQuiz() {
    await sacarPreguntas();
    printQuestions(arrayPreguntas, lienzo)
    activarBotones();
}

// local storage
function localScore() {
    //Parse any JSON previously stored in allEntries
    let existingEntries = JSON.parse(localStorage.getItem("puntuaciones"));
    if (existingEntries == null) existingEntries = [{ "puntuacion": 0, "fecha": fecha }];

    let score = {
        "puntuacion": aciertos,
        "fecha": fecha
    }

    localStorage.setItem("score", JSON.stringify(score));

    // Save allEntries back to local storage
    existingEntries.push(score);
    localStorage.setItem("puntuaciones", JSON.stringify(existingEntries));
}


startQuiz()

let arrayX = []
let arrayY = []
if (localStorage.length !== 0) {
    let existingEntries = JSON.parse(localStorage.getItem("puntuaciones"));
    for (let i = 0; i < existingEntries.length; i++) {
        arrayY.push(existingEntries[i].puntuacion);
        arrayX.push(existingEntries[i].fecha);
    }
}



// grafica

var data = {
    labels: arrayX.slice(-4),
    series: [
        arrayY.slice(-4)
    ]
};
var options = {
    height: 400,
    onlyInteger: true,
    low: 0,
    axisX: {
        offset: 200
    },
    axisY: {
        onlyInteger: true,
        offset: 80,
        labelInterpolationFnc: function (value) {
            return '' + value + '';
        }
    }
};

new Chartist.Bar('.ct-chart', data, options);
