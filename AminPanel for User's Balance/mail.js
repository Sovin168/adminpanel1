// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsxLaWoGjFyXmTJ88ylBktpCX5cMdm9k0",
    authDomain: "spebook1.firebaseapp.com",
    projectId: "spebook1",
    storageBucket: "spebook1.appspot.com",
    messagingSenderId: "56132650952",
    appId: "1:56132650952:web:07f6ae2287dc12878a62fd"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Reference to the Firestore collection
const contactFormDB = db.collection("users");

// Form handling
document.getElementById("bookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const lastName = document.getElementById("lastname").value;
    const firstName = document.getElementById("firstname").value;
    const email = document.getElementById("email").value;
    const balance = document.getElementById("balance").value;

    // Show loading state
    document.querySelector("button[type='submit']").innerText = "Uploading...";
    document.querySelector("button[type='submit']").disabled = true;


    try {
        // Add new record to Firestore
        await contactFormDB.add({
            lastName,
            firstName,
            email,
            balance
        });

        // Reset form and hide spinner
        document.getElementById("bookForm").reset();
        document.getElementById("loadingSpinner").style.display = "none";

        // Refresh the table
        fetchBookData();

        alert("Data submitted successfully!");
    } catch (error) {
        console.error("Error submitting data: ", error);
        alert("Error submitting data. Please try again.");
    }

    // Reset submit button state
    document.querySelector("button[type='submit']").innerText = "Submit";
    document.querySelector("button[type='submit']").disabled = false;
});

// Fetch and display book data in the table
function fetchBookData() {
    contactFormDB.get().then((snapshot) => {
        const books = snapshot.docs;
        const tableBody = document.getElementById("bookDataBody");

        tableBody.innerHTML = ""; // Clear the table before displaying new data

        books.forEach((doc) => {
            const book = doc.data();
            appendToTable(book, doc.id);
        });
    });
}

// Fetch and display data on page load
window.onload = function () {
    fetchBookData();
};

// Add new book data to the table
function appendToTable(data, key) {
    const tableBody = document.getElementById("bookDataBody");

    const row = document.createElement("tr");
    row.id = `row-${key}`;

    row.innerHTML = `
        <td>${data.lastName}</td>
        <td>${data.firstName}</td>
        <td>${data.email}</td>
        <td>${data.balance}</td>
    `;

    // Add row to the table
    tableBody.appendChild(row);

    // Add click event to populate the form with selected book data
    row.addEventListener("click", function () {
        populateFormFields(data, key);
    });
}

// Populate form fields when clicking a row
function populateFormFields(data, key) {
    document.getElementById("lastname").value = data.lastName;
    document.getElementById("firstname").value = data.firstName;
    document.getElementById("email").value = data.email;
    document.getElementById("balance").value = data.balance;
    document.getElementById("bookKey").value = key;
}

// Update existing book data
document.getElementById("updateBtn").addEventListener("click", function () {
    const key = document.getElementById("bookKey").value;

    if (key) {
        contactFormDB.doc(key).update({
            lastName: document.getElementById("lastname").value,
            firstName: document.getElementById("firstname").value,
            email: document.getElementById("email").value,
            balance: document.getElementById("balance").value
        }).then(() => {
            // Refresh the table after update
            fetchBookData();
            alert("Data updated successfully!");
        });
    } else {
        alert("Please select a record to update.");
    }
});

// Delete book data
document.getElementById("deleteBtn").addEventListener("click", function () {
    const key = document.getElementById("bookKey").value;

    if (key) {
        contactFormDB.doc(key).delete()
            .then(() => {
                // Refresh the table after deletion
                fetchBookData();
                document.getElementById("bookForm").reset();
                alert("Data deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting data: ", error);
                alert("Failed to delete data. Please try again.");
            });
    } else {
        alert("Please select a record to delete.");
    }
});

// Add new record button
document.getElementById("addNewBtn").addEventListener("click", function () {
    document.getElementById("bookForm").reset();
    document.getElementById("bookKey").value = "";
    alert("Form cleared. You can now add a new record.");
});

// Search functionality
document.getElementById("searchBtn").addEventListener("click", function () {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();

    contactFormDB.get().then((snapshot) => {
        const books = snapshot.docs;
        const tableBody = document.getElementById("bookDataBody");

        tableBody.innerHTML = ""; // Clear the table before displaying search results

        books.forEach((doc) => {
            const book = doc.data();
            if (book.lastName.toLowerCase().includes(searchValue) || book.firstName.toLowerCase().includes(searchValue)|| book.email.toLowerCase().includes(searchValue)) {
                const row = document.createElement("tr");
                row.id = `row-${doc.id}`;
                row.innerHTML = `
                    <td>${book.lastName}</td>
                    <td>${book.firstName}</td>
                    <td>${book.email}</td>
                    <td>${book.balance}</td>
                `;
                tableBody.appendChild(row);
            }
        });
    });
});
