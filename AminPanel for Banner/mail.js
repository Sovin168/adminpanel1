// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAsxLaWoGjFyXmTJ88ylBktpCX5cMdm9k0",
  authDomain: "spebook1.firebaseapp.com",
  databaseURL: "https://spebook1-default-rtdb.firebaseio.com",
  projectId: "spebook1",
  storageBucket: "spebook1.appspot.com",
  messagingSenderId: "56132650952",
  appId: "1:56132650952:web:07f6ae2287dc12878a62fd"
};

firebase.initializeApp(firebaseConfig);

// Reference to your database
var contactFormDB = firebase.database().ref("bannerData");

// Reference Firebase Storage
const storage = firebase.storage();

// Handle form submission
document.getElementById("bookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const companyName = document.getElementById("companyName").value;
    const category = document.getElementById("category").value;
    const bannerDescription = document.getElementById("bannerDescription").value;
    const imageFile = document.getElementById("uploadImage").files[0];
    const mediaFile = document.getElementById("uploadMedia").files[0];

    // Show loading state
    document.querySelector("button[type='submit']").innerText = "Uploading...";
    document.querySelector("button[type='submit']").disabled = true;

    let imageUrl = "";
    let mediaUrl = "";

    try {
        // Upload files to Firebase Storage and get URLs
        if (imageFile) {
            const imageSnapshot = await storage.ref(`banner_image/${imageFile.name}`).put(imageFile);
            imageUrl = await imageSnapshot.ref.getDownloadURL();
        }
       
        if (mediaFile) {
            const mediaSnapshot = await storage.ref(`banner_media/${mediaFile.name}`).put(mediaFile);
            mediaUrl = await mediaSnapshot.ref.getDownloadURL();
        }

        // Save data to Firebase Realtime Database
        const newBookRef = contactFormDB.push();
        newBookRef.set({
            companyName,
            category,
            bannerDescription,
            imageUrl,
            mediaUrl,
        });
    } catch (error) {
        console.error("Error uploading files: ", error);
        alert("Error uploading files. Please try again.");
    }

    // Reset button state
    document.querySelector("button[type='submit']").innerText = "Submit";
    document.querySelector("button[type='submit']").disabled = false;
});

// Fetch and display book data in the table
function fetchBookData() {
    contactFormDB.once("value", function(snapshot) {
        const books = snapshot.val();
        const tableBody = document.getElementById("bookDataBody");

        tableBody.innerHTML = ""; // Clear the table before displaying new data

        for (const key in books) {
            const book = books[key];
            appendToTable(book, key); // Pass the book data and the key to append to the table
        }
    });
}

// Initially fetch and display the data when the page loads
window.onload = function() {
    fetchBookData();
};

// Auto-refresh the table when data is added, updated, or deleted
contactFormDB.on('child_added', function(data) {
    appendToTable(data.val(), data.key); // Append new data
});

contactFormDB.on('child_changed', function(data) {
    const rowToUpdate = document.querySelector(`#row-${data.key}`);
    if (rowToUpdate) {
        rowToUpdate.innerHTML = generateRowHTML(data.val(), data.key); // Update the row in the table
    }
});

contactFormDB.on('child_removed', function(data) {
    const rowToRemove = document.querySelector(`#row-${data.key}`);
    if (rowToRemove) {
        rowToRemove.remove(); // Remove the row from the table
    }
});

// Add New Button functionality
document.getElementById("addNewBtn").addEventListener("click", function () {
    // Reset the form fields
    document.getElementById("bookForm").reset();

    // Clear the hidden key field to avoid updating existing records
    document.getElementById("bookKey").value = "";

    // Optionally focus on the first input field for better UX
    document.getElementById("companyName").focus();

    alert("Form cleared. You can now add a new record.");
});

// Update button functionality
document.getElementById("updateBtn").addEventListener("click", () => {
    const key = document.getElementById("bookKey").value;

    if (key) {
        contactFormDB.child(key).update({
            companyName: getElementVal("companyName"),
            category: getElementVal("category"),
            bannerDescriptionDescription: getElementVal("bannerDescription"),
        }).then(() => {
            fetchBookData(); // Refresh the table after update
        });
    } else {
        alert("Please select a book from the table to update.");
    }
});

// Delete button functionality
document.getElementById("deleteBtn").addEventListener("click", () => {
    const key = document.getElementById("bookKey").value;

    if (key) {
        // First, get the data associated with this key
        contactFormDB.child(key).once("value", function(snapshot) {
            const data = snapshot.val();

            // Delete image from Firebase Storage if exists
            if (data.imageUrl) {
                const imageRef = firebase.storage().refFromURL(data.imageUrl);
                imageRef.delete().then(() => {
                    console.log("Image deleted successfully.");
                }).catch((error) => {
                    console.error("Error deleting image:", error);
                });
            }

            // Delete media from Firebase Storage if exists
            if (data.mediaUrl) {
                const mediaRef = firebase.storage().refFromURL(data.mediaUrl);
                mediaRef.delete().then(() => {
                    console.log("Media deleted successfully.");
                }).catch((error) => {
                    console.error("Error deleting media:", error);
                });
            }

            // Delete the data from Realtime Database
            contactFormDB.child(key).remove().then(() => {
                console.log("Data deleted from database.");
                fetchBookData(); // Refresh the table
                document.getElementById("bookForm").reset(); // Clear the form
            }).catch((error) => {
                console.error("Error deleting data from database:", error);
            });

        });
    } else {
        alert("Please select a book from the table to delete.");
    }
});


// Detect when the search input is cleared
document.getElementById("searchInput").addEventListener("input", function () {
  const searchValue = this.value.trim();

  if (searchValue === "") {
      // If the input is empty, reload the full data
      fetchBookData(); // Reload all data
  }
});

// Helper function to get value from input field
const getElementVal = (id) => {
  return document.getElementById(id).value;
};

// Generate row HTML
function generateRowHTML(data, key) {
  return `
      <td>${data.companyName}</td>
      <td>${data.category}</td>
      <td>${data.bannerDescription}</td>
      <td>${data.imageUrl ? `<img src="${data.imageUrl}" alt="Image" width="50" height="50">` : "N/A"}</td>
      <td>${data.mediaUrl ? `<a href="${data.mediaUrl}" target="_blank">View Media</a>` : "N/A"}</td>
  `;
}

// Fetch and display book data in the table (for when the search input is cleared)
function fetchBookData() {
  contactFormDB.once("value", function(snapshot) {
      const books = snapshot.val();
      const tableBody = document.getElementById("bookDataBody");

      tableBody.innerHTML = ""; // Clear the table before displaying new data

      for (const key in books) {
          const book = books[key];
          const row = document.createElement('tr');
          row.id = `row-${key}`;

          row.innerHTML = generateRowHTML(book, key);

          // Add the click event to populate the form fields with selected book data
          row.addEventListener("click", function () {
              populateFormFields(book, key);
          });

          tableBody.appendChild(row);
      }
  });
}

// Populate form fields with the selected book's data
function populateFormFields(data, key) {
  document.getElementById("companyName").value = data.companyName;
  document.getElementById("category").value = data.category;
  document.getElementById("bannerDescription").value = data.bannerDescription;
  document.getElementById("bookKey").value = key; // Hidden field to store the database key
}

// Append the book data to the table
function appendToTable(data, key) {
    const tableBody = document.getElementById("bookDataBody");

    // Create a new row
    const row = document.createElement("tr");
    row.id = `row-${key}`;

    row.innerHTML = generateRowHTML(data, key);

    // Add row to the table
    tableBody.appendChild(row);

    // Add click event listener to the row to populate the form with the selected book's details
    row.addEventListener("click", function () {
        populateFormFields(data, key);
    });
}

// Listen for real-time changes to the database
contactFormDB.on('child_added', function(snapshot) {
  const data = snapshot.val();

  // Create a new table row
  const row = document.createElement('tr');

  // Create and append cells for each field
  row.innerHTML = `
    <td>${data.companyName}</td>
    <td>${data.category}</td>
    <td>${data.bannerDescription}</td>
    <td><img src="${data.imageURL}" alt="Image" width="50"></td>
    <td><a href="${data.mediaURL}" target="_blank">Media</a></td>
  `;

  // Prepend the row to the table body to show new data at the top
  const tableBody = document.getElementById("bookDataBody");
  tableBody.insertBefore(row, tableBody.firstChild);
});