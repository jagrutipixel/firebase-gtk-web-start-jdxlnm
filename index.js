// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import {getAuth, EmailAuthProvider,signOut,
  onAuthStateChanged} from 'firebase/auth';
import {getFirestore,addDoc,collection,query,orderBy,onSnapshot,doc,setDoc,where} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

let rsvpListener = null;
let guestbookListener = null;

let db, auth;

  // Add Firebase project configuration object here
    const firebaseConfig = {
      apiKey: "AIzaSyCh1laWFKtxo6UPMZUHFXkh2FXfrDGz2V8",
      authDomain: "fir-web-codelab-3b06d.firebaseapp.com",
      projectId: "fir-web-codelab-3b06d",
      storageBucket: "fir-web-codelab-3b06d.appspot.com",
      messagingSenderId: "964144390189",
      appId: "1:964144390189:web:fe3b59ebbd02f7771d58a4"
      };

  initializeApp(firebaseConfig);
  auth = getAuth();
  db = getFirestore();
  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      },
    },
  };
  
async function main() {
 // ...

  // Initialize the FirebaseUI widget using Firebase
  const ui = new firebaseui.auth.AuthUI(auth);
  // Called when the user clicks the RSVP button
startRsvpButton.addEventListener('click', () => {
  if (auth.currentUser) {
    // User is signed in; allows user to sign out
    signOut(auth);
  } else {
    // No user is signed in; allows user to sign in
    ui.start('#firebaseui-auth-container', uiConfig);
  }
});
  
  // Listen to the current Auth state
  onAuthStateChanged(auth, user => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      // Show guestbook to logged-in users
      guestbookContainer.style.display = 'block';
    } else {
      startRsvpButton.textContent = 'RSVP';
      // Hide guestbook for non-logged-in users
      guestbookContainer.style.display = 'none';
    }
  });
  // Listen to the form submission
  form.addEventListener('submit', async e => {
    // Prevent the default form redirect
    e.preventDefault();
    // Write a new message to the database collection "guestbook"
    addDoc(collection(db, 'guestbook'), {
      text: input.value,
      timestamp: Date.now(),
      name: auth.currentUser.displayName,
      userId: auth.currentUser.uid
    });
    // clear message input field
    input.value = '';
    // Return false to avoid redirect
    return false;
  });
  // Create query for messages
  const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
  onSnapshot(q, snaps => {
    // Reset page
    guestbook.innerHTML = '';
    // Loop through documents in database
    snaps.forEach(doc => {
      // Create an HTML entry for each document and add it to the chat
      const entry = document.createElement('p');
      entry.textContent = doc.data().name + ': ' + doc.data().text;
      guestbook.appendChild(entry);
    });
  });
  // ...
// Listen to the current Auth state
onAuthStateChanged(auth, user => {
  if (user) {
    startRsvpButton.textContent = 'LOGOUT';
    // Show guestbook to logged-in users
    guestbookContainer.style.display = 'block';
    // Subscribe to the guestbook collection
    subscribeGuestbook();
  } else {
    startRsvpButton.textContent = 'RSVP';
    // Hide guestbook for non-logged-in users
    guestbookContainer.style.display = 'none';
    // Unsubscribe from the guestbook collection
    unsubscribeGuestbook();
  }
});
 // Listen to RSVP responses
 rsvpYes.onclick = async () => {
};
rsvpNo.onclick = async () => {
};
// Listen to RSVP responses
rsvpYes.onclick = async () => {
  // Get a reference to the user's document in the attendees collection
  const userRef = doc(db, 'attendees', auth.currentUser.uid);

  // If they RSVP'd yes, save a document with attendi()ng: true
  try {
    await setDoc(userRef, {
      attending: true
    });
  } catch (e) {
    console.error(e);
  }
};
rsvpNo.onclick = async () => {
  // Get a reference to the user's document in the attendees collection
  const userRef = doc(db, 'attendees', auth.currentUser.uid);

  // If they RSVP'd yes, save a document with attending: true
  try {
    await setDoc(userRef, {
      attending: false
    });
  } catch (e) {
    console.error(e);
  }
};
  // Listen for attendee list
  const attendingQuery = query(
    collection(db, 'attendees'),
    where('attending', '==', true)
  );
  const unsubscribe = onSnapshot(attendingQuery, snap => {
    const newAttendeeCount = snap.docs.length;
    numberAttending.innerHTML = newAttendeeCount + ' people going';
  });
}
// Listen for attendee list
function subscribeCurrentRSVP(user) {
  const ref = doc(db, 'attendees', user.uid);
  rsvpListener = onSnapshot(ref, doc => {
    if (doc && doc.data()) {
      const attendingResponse = doc.data().attending;

      // Update css classes for buttons
      if (attendingResponse) {
        rsvpYes.className = 'clicked';
        rsvpNo.className = '';
      } else {
        rsvpYes.className = '';
        rsvpNo.className = 'clicked';
      }
    }
  });
}
// ...
function unsubscribeCurrentRSVP() {
  if (rsvpListener != null) {
    rsvpListener();
    rsvpListener = null;
  }
  rsvpYes.className = '';
  rsvpNo.className = '';
}
  // Listen to the current Auth state
  onAuthStateChanged(auth, user => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      // Show guestbook to logged-in users
      guestbookContainer.style.display = 'block';

      // Subscribe to the guestbook collection
      subscribeGuestbook();
      // Subscribe to the user's RSVP
      subscribeCurrentRSVP(user);
    } else {
      startRsvpButton.textContent = 'RSVP';
      // Hide guestbook for non-logged-in users
      guestbookContainer.style.display = 'none'
      ;
      // Unsubscribe from the guestbook collection
      unsubscribeGuestbook();
      // Unsubscribe from the guestbook collection
      unsubscribeCurrentRSVP();
    }
  });
main();