//firebase
const firebaseConfig = {
  apiKey: "AIzaSyBOsTuYeIMk21TURaxYK_fwOTUUaxOCRUU",
  authDomain: "puntuacion-quiz-ii.firebaseapp.com",
  projectId: "puntuacion-quiz-ii",
  storageBucket: "puntuacion-quiz-ii.appspot.com",
  messagingSenderId: "785165930933",
  appId: "1:785165930933:web:18fb6768a127c598f809fc",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// seleccion el boton de register/login
const btnRegistroLogin = document.querySelector("#login");
let esVisible = false;

// hacer que el boton aparezca y desaparezca al pulsarlo.
btnRegistroLogin.addEventListener("click", function () {
  if (esVisible) {
    document.querySelector("#formularios1").style.display = "none";
    esVisible = false;
  } else {
    document.querySelector("#formularios1").style.display = "block";
    esVisible = true;
  }
});

let user = firebase.auth().currentUser;

const lienzo = document.getElementsByClassName("pantalla_preguntas")[0];
const arrayPreguntas = [];
const arrayRespuestas = [];
let contador = 0;
let aciertos = 0;
let fecha = new Date().toLocaleString();
let userScore = { puntuacion: 0, fecha: fecha };

createUser = (user) => {
  db.collection("users")
    .add(user)
    .then((docRef) => console.log("Document written with ID: ", docRef.id))
    .catch((error) => console.error("Error adding document: ", error));
};

//SIGNUP
const signUpUser = (email, password) => {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      let user = userCredential.user;
      console.log(
        `Se ha registrado un nuevo usuario con el email: ${user.email} y ID:${user.uid}`
      );
      alert(`Se ha registrado ${user.email} ID:${user.uid}`);
      createUser({
        id: user.uid,
        email: user.email,
        puntuaciones: [],
      });
    })
    .catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log("Error en el sistema" + errorCode + errorMessage);
    });
};

//PASS1 = PASS2
document.getElementById("form1").addEventListener("submit", function (event) {
  event.preventDefault();
  let email = event.target.elements.email.value;
  let pass = event.target.elements.pass.value;
  let pass2 = event.target.elements.pass2.value;
  if (pass === pass2) {
    signUpUser(email, pass);
    if (firebase.auth().currentUser) {
      // inicie el juego
    } else {
      alert("Por favor inicie sesión antes de comenzar a jugar");
    }
  } else {
    alert("error password");
  }
});

//SIGNIN - SIGNOUT
const signInUser = (email, password) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      let user = userCredential.user;
      console.log(`se ha logado ${user.email} ID:${user.uid}`);
      alert(`se ha logado ${user.email} ID:${user.uid}`);
    let email = user.email;
    document.querySelector('.email-circle').innerHTML = `Bienvenido ${email}`;;
    })
    .catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
};
const signOut = () => {
  let user = firebase.auth().currentUser;
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("Sale del sistema: " + user.email);
    })
    .catch((error) => {
      console.log("hubo un error: " + error);
    });
};

//ANON
function anon() {
  firebase
    .auth()
    .signInAnonymously()
    .then(() => {
      console.log("Sesión anónima");
      alert("Sesión anónima. No se gurdarán puntuaciones");
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
}

document.getElementById("form2").addEventListener("submit", function (event) {
  event.preventDefault();
  let email = event.target.elements.email2.value;
  let pass = event.target.elements.pass3.value;
  signInUser(email, pass);
});
document.getElementById("salir").addEventListener("click", () => {
  signOut();
  document.location.reload("true");
});
document.getElementById("anon").addEventListener("click", () => {
  anon();
});

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log(`Está logeado el usuario:${user.email} ${user.uid}`)
    let email = user.email;
    document.querySelector('.email-circle').innerHTML = `Bienvenido ${email}`;
  } else {
    console.log("no hay usuarios en el sistema");
  }
});

function subirPuntuacion(userId, userScore) {
  db.collection("users")
    .where("id", "==", userId)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        if (!doc.data().hasOwnProperty("puntuaciones")) {
          doc.ref.update({ puntuaciones: [userScore] });
        } else {
          doc.ref.update({
            puntuaciones: doc.data().puntuaciones.concat(userScore),
          });
        }
        alert("Puntuación guardada");
      });
    });
}

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
  console.log(`Tus aciertos han sido: ${aciertosUser}`);
  console.log(`La fecha de la partida ha sido: ${fecha}`);
  userScore = { puntuacion: aciertosUser, fecha: fecha };
}

function subirPuntuacion(userID, userScore) {
  db.collection("users")
    .where("id", "==", userID)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        if (!doc.data().hasOwnProperty("puntuaciones")) {
          doc.ref.update({ puntuaciones: [userScore] });
        } else {
          doc.ref.update({
            puntuaciones: doc.data().puntuaciones.concat(userScore),
          });
        }
        alert("Added to Score");
      });
    });
}

// pintar preguntas

async function sacarPreguntas() {
  let resp = await fetch("https://opentdb.com/api.php?amount=10&type=multiple");
  let rawData = await resp.json();
  let listaPreguntas = rawData.results;
  for (let i = 0; i < listaPreguntas.length; i++)
    arrayPreguntas.push(listaPreguntas[i]);
}

function printQuestions(arrayPreguntas, lienzo) {
  for (let i = 0; i < arrayPreguntas.length; i++) {
    let tarjeta = document.createElement("div");
    tarjeta.setAttribute("class", "pregunta" + i);
    tarjeta.setAttribute("id", "pregunta" + i);
    const que = randomizar([
      arrayPreguntas[i].correct_answer,
      arrayPreguntas[i].incorrect_answers[0],
      arrayPreguntas[i].incorrect_answers[1],
      arrayPreguntas[i].incorrect_answers[2],
    ]);
    let q1 = que();
    let q2 = que();
    let q3 = que();
    let q4 = que();

    tarjeta.innerHTML = `<fieldset>
        <legend id=${i}>${i + 1} - ${arrayPreguntas[i].question}</legend>
        <div>
        <input class="pregunta" id="a${i}" type="radio" name=pregunta${i}" value=${q1
      .split(" ")
      .join("")}>
        <label id=r${i}0 for="a${i}">${q1}</label>
        </div>
        <div>
        <input class="pregunta" id="b${i}" type="radio" name=pregunta${i}" value=${q2
      .split(" ")
      .join("")}>
        <label id=r${i}1 for="b${i}">${q2}</label>
        </div>
        <div>
        <input class="pregunta" id="c${i}" type="radio" name=pregunta${i}" value=${q3
      .split(" ")
      .join("")}>
        <label id=r${i}2 for="c${i}">${q3}</label>
        </div>
        <div>
        <input class="pregunta" id="d${i}" type="radio" name=pregunta${i}" value=${q4
      .split(" ")
      .join("")}>
        <label id=r${i}3 for="d${i}">${q4}</label>
        </div>
        </fieldset >
        <article><button class="btnPreguntas${i} boton">SIGUIENTE PREGUNTA</button></article>`;

    lienzo.appendChild(tarjeta);
  }
}

function activarBotones() {
  const botones = [];
  for (let i = 0; i <= 9; i++) {
    let boton = document.querySelector(`.btnPreguntas${i}`);
    botones.push(boton);
  }
  botones.forEach((element) =>
    element.addEventListener("click", () => {
      rotar();
    })
  );
  // añadimos evento de al clickar el boton comenzar a jugar haga la funcion empezar.
  document.getElementById("botonEmpezar").addEventListener("click", () => {
    empezar();
  });
  document.getElementById("signUp").addEventListener("click", () => {
    empezar();
  });
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
  }
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
  let respuestas = document.querySelectorAll("input:checked");
  if (respuestas.length !== arrayPreguntas.length) {
    alert("No se respondieron todas.");
    location.reload(true);
  }
  for (let i = 0; i < arrayPreguntas.length; i++) {
    let chosen = respuestas[i].value;
    arrayRespuestas.push(chosen);
  }

  validar();

  sacarPuntuacion();

  subirPuntuacion(firebase.auth().currentUser.uid, userScore);

  const pantallaFinal = document.querySelector(".pantalla_final");
  pantallaFinal.style.display = "block";

  let results = document.querySelector("#numCorrectas");
  results.innerHTML = `${aciertos}/10`;

  const todasLasPantallasPreguntas = document.querySelectorAll(
    ".pantalla_preguntas"
  );
  todasLasPantallasPreguntas.forEach(
    (pantalla) => (pantalla.style.display = "none")
  );
}

function validar() {
  for (let i = 0; i < arrayPreguntas.length; i++) {
    if (
      arrayRespuestas[i] ===
      arrayPreguntas[i].correct_answer.split(" ").join("")
    ) {
      aciertos++;
    }
  }
}

function randomizar(array) {
  let copia = Array.from(array); // Create a copy of input array
  return function () {
    if (copia.length < 1) {
      copia = Array.from(array);
    } // This line exist to create copy and make a new array from actual array whenever all possible options are selected once
    const index = Math.floor(Math.random() * copia.length); // Select an index randomly
    const item = copia[index]; // Get the index value
    copia.splice(index, 1); // Remove selected element from copied array
    return item; // Return selected element
  };
}

async function startQuiz() {
  await sacarPreguntas();
  printQuestions(arrayPreguntas, lienzo);
  activarBotones();
}

// local storage
/*function localScore() {
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
}*/

startQuiz();

// let arrayX = [];
// let arrayY = [];
// if (localStorage.length !== 0) {
//   let existingEntries = JSON.parse(localStorage.getItem("puntuaciones"));
//   for (let i = 0; i < existingEntries.length; i++) {
//     arrayY.push(existingEntries[i].puntuacion);
//     arrayX.push(existingEntries[i].fecha);
//   }
// }

// // Recupera los datos de las puntuaciones de los usuarios desde Firebase
// db.collection("usuarios").get().then((querySnapshot) => {
//     let data = { labels: [], series: [[]] }; // Inicializa el objeto de datos para la gráfica
//     querySnapshot.forEach((doc) => {
//         let usuario = doc.data();
//         data.labels.push(usuario.email); // Agrega el email del usuario como etiqueta para el eje x
//         data.series[0].push(usuario.puntuacion); // Agrega la puntuación del usuario como dato para el eje y
//     });
//     // Crea y personaliza la gráfica de Chartist
//     new Chartist.Bar('.ct-chart', data);
// });

// variables para almacenar las puntuaciones y fechas
// let arrayX = [];
// let arrayY = [];


// db.collection("users")
// .get()
// .then(snap => {
//     snap.forEach(doc => {
//         // Obtener las puntuaciones y fechas del usuario actual
//         let puntuaciones = doc.data().puntuaciones;
//         for (let i = 0; i < puntuaciones.length; i++) {
//             let puntuacion = puntuaciones[i].puntuacion;
//             let fecha = puntuaciones[i].fecha;
//             // Agregar la puntuación y la fecha al arreglo correspondiente
//             arrayX.push(fecha);
//             arrayY.push(puntuacion);
//         }
//     });
//     // comprobar si el usuario está logueado y tiene puntuaciones
//     if (firebase.auth().currentUser && arrayX.length > 0 && arrayY.length > 0) {
//         // Crear gráfica
//         var data = {
//             labels: arrayX.slice(-4),
//             series: [
//                 arrayY.slice(-4)
//             ]
//         };
//         var options = {
//             height: 400,
//             onlyInteger: true,
//             low: 0,
//             axisX: {
//                 offset: 200
//             },
//             axisY: {
//                 onlyInteger: true,
//                 offset: 80,
//                 labelInterpolationFnc: function (value) {
//                     return '' + value + '';
//                 }
//             }
//         };
//         new Chartist.Bar('.ct-chart', data, options);
//     } else {
//         console.log("Por favor inicie sesión o no tiene puntuaciones");
//     }
// });

let arrayX = [];
let arrayY = [];

// obtener las puntuaciones del usuario actual
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        db.collection("users")
        .where("id", "==", user.uid)
        .get()
        .then(snap => {
            snap.forEach(doc => {
                // Obtener las puntuaciones del usuario actual
                let puntuaciones = doc.data().puntuaciones;
                for (let i = 0; i < puntuaciones.length; i++) {
                    let puntuacion = puntuaciones[i].puntuacion;
                    let fecha = puntuaciones[i].fecha;
                    // Agregar la puntuación y la fecha al arreglo correspondiente
                    arrayX.push(fecha);
                    arrayY.push(puntuacion);
                }
            });
            // comprobar si el usuario tiene puntuaciones
            if (arrayX.length > 0 && arrayY.length > 0) {
                // Crear gráfica
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
                    },
                    barWidth: 0.8 // establecer el ancho de las barras
                };
                
                new Chartist.Bar('.ct-chart', data, options);
            } else {
                console.log("No tiene puntuaciones");
            }
        });
    } else {
        console.log("Por favor inicie sesión");
    }
});

// // grafica

// var data = {
//   labels: arrayX.slice(-4),
//   series: [arrayY.slice(-4)],
// };
// var options = {
//   height: 400,
//   onlyInteger: true,
//   low: 0,
//   axisX: {
//     offset: 200,
//   },
//   axisY: {
//     onlyInteger: true,
//     offset: 80,
//     labelInterpolationFnc: function (value) {
//       return "" + value + "";
//     },
//   },
// };

