const createUser = (user) => {
    db.collection("users")
      .add(user)
      .then((docRef) => console.log("Document written with ID: ", docRef.id))
      .catch((error) => console.error("Error adding document: ", error));
  };
  document.getElementById("crear").addEventListener("click", () => {
    const first = prompt("Introduce nombre");
    const last = prompt("Introduce apellido");
    createUser({
      first,
      last
    });
  });
  const readAllUsers = (born) => {
    db.collection("users")
      .where("first", "==", born)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log(doc.data());
        });
      });
  };
  //readAllUsers(1224)
  // Read ONE
  function readOne(id) {
    db.collection("users")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log("Document data:", doc.data());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
  //readOne("690WYQfTZUoEFnq5q1Ov");
  /**************Firebase Auth*****************/
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
  //"alex@demo.com","123456"
  document.getElementById("form1").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.email.value;
    let pass = event.target.elements.pass.value;
    let pass2 = event.target.elements.pass2.value;
    pass === pass2 ? signUpUser(email, pass) : alert("error password");
  })
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
  document.getElementById("form2").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.email2.value;
    let pass = event.target.elements.pass3.value;
    signInUser(email, pass)
  })
  document.getElementById("salir").addEventListener("click", signOut);
  // Listener de usuario en el sistema
  // Controlar usuario logado
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log(`Está en el sistema:${user.email} ${user.uid}`);
    } else {
      console.log("no hay usuarios en el sistema");
    }
  });