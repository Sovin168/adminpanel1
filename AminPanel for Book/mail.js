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

// Reference to Firebase Realtime Database
const database = firebase.database();  // Define database reference

// Reference to Firebase Realtime Database
var contactFormDB = firebase.database().ref("bookData");

// Reference to Firebase Storage
const storage = firebase.storage();


// Handle form submission
document.getElementById("bookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Retrieve form values
    const bookName = document.getElementById("bookName").value;
    const category = document.getElementById("category").value;
    const subCategory = document.getElementById("subCategory").value;
    const bookDescription = document.getElementById("bookDescription").value;
    const bookAuthor = document.getElementById("bookAuthor").value;
    const language = document.getElementById("language").value;
    const bookPublicDate = document.getElementById("bookPublicDate").value;
    const bookRate = document.getElementById("bookRate").value;
    const bookStatue = document.getElementById("bookStatue").value;
    const bookPrice = document.getElementById("bookPrice").value;
    const bookDiscount = document.getElementById("bookDiscount").value;
    const bookPricediscount = document.getElementById("bookPricediscount").value;

    // Retrieve file inputs
    const imageFiles = document.getElementById("uploadImage").files[0]; // Changed this to get multiple files
    const pdfFile = document.getElementById("uploadPDF").files[0];
    const mediaFile = document.getElementById("uploadMedia").files[0];

    // Show loading state
    const submitButton = document.querySelector("button[type='submit']");
    submitButton.innerText = "Uploading...";
    submitButton.disabled = true;

    let imageURLs ="";  // Initialize an empty array for image URLs
    let pdfURL = "";
    let mediaURL = "";

    try {
        // Validate required fields
        if (!bookName || !category) {
            alert("Please fill in all required fields.");
            submitButton.innerText = "Submit";
            submitButton.disabled = false;
            return;
        }

        // Upload multiple images to Firebase Storage and get URLs
        if (imageFiles) {
            const imageSnapshot = await storage.ref(`images/${imageFiles.name}`).put(imageFiles);
            imageURLs = await imageSnapshot.ref.getDownloadURL();
        }

        // Upload PDF to Firebase Storage and get URL
        if (pdfFile) {
            if (pdfFile.type !== 'application/pdf') {
                alert("Please upload a valid PDF file.");
                submitButton.innerText = "Submit";
                submitButton.disabled = false;
                return;
            }
            const pdfSnapshot = await storage.ref(`pdfs/${bookName}_${pdfFile.name}`).put(pdfFile);
            pdfURL = await pdfSnapshot.ref.getDownloadURL();
        }

        // Upload media (if any) to Firebase Storage and get URL
        if (mediaFile) {
            const mediaSnapshot = await storage.ref(`medias/${bookName}_${mediaFile.name}`).put(mediaFile);
            mediaURL = await mediaSnapshot.ref.getDownloadURL();
        }

        const cambodiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" }));

        // Save data to Firebase Realtime Database
        const newBookRef = contactFormDB.push();
        newBookRef.set({
            bookName,
            category,
            subCategory,
            bookDescription,
            bookAuthor,
            language,
            bookPublicDate,
            bookRate,
            bookStatue,
            bookPrice,
            bookDiscount,
            bookPricediscount,
            imageUrl: imageURLs,  // Store all image URLs as an array
            pdfUrl: pdfURL,       // Store PDF URL
            mediaUrl: mediaURL,   // Store media URL
            updatedAt: cambodiaTime.toISOString()  // Store the current time
        });

        alert("Book successfully added!");

        // Clear the form after submission
        clearForm();

    } catch (error) {
        console.error("Error uploading files: ", error);
        alert("Error uploading files. Please try again.");
    }

    // Reset button state
    submitButton.innerText = "Submit";
    submitButton.disabled = false;
});



// Function to clear the form fields
function clearForm() {
document.getElementById('bookName').value = '';
document.getElementById('category').value = '';
document.getElementById('subCategory').value = '';
document.getElementById('bookDescription').value = '';
document.getElementById('bookAuthor').value = '';
document.getElementById('language').value = '';
document.getElementById('bookPublicDate').value = '';
document.getElementById('bookRate').value = '';
document.getElementById('bookStatue').value = '';
document.getElementById('bookPrice').value = '';
document.getElementById('bookDiscount').value = '';
document.getElementById('bookPricediscount').value = '';
document.getElementById('uploadImage').value = '';
document.getElementById('uploadPDF').value = '';
document.getElementById('uploadMedia').value = '';
document.getElementById('bookKey').value = '';  // Clear the file input
}

// Function to remove existing highlights and add a new one
function highlightRow(row) {
    // Remove highlight from all rows
    document.querySelectorAll("#bookDataBody tr").forEach(tr => {
        tr.style.backgroundColor = ""; // Reset color
    });

    // Highlight the selected row
    row.style.backgroundColor = "#d3e2ff"; // Light blue highlight
}

// Function to highlight a row when clicked
function highlightRow(row) {
    // Remove highlight from all rows
    const rows = document.querySelectorAll('#bookDataBody tr');
    rows.forEach(r => r.classList.remove('highlight'));

    // Add highlight to the clicked row
    row.classList.add('highlight');
}


// Modify existing row click event to include highlighting
function addRowClickEvent(row, book, bookId) {
    row.addEventListener('click', function () {
        // Highlight selected row
        const previouslySelected = document.querySelector('tr.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
         // Highlight the selected row
         highlightRow(row);
        row.classList.add('selected');

        // Match JS properties to HTML input field IDs
        document.getElementById('bookName').value = book.bookName || '';
        document.getElementById('category').value = book.category || '';
        document.getElementById('subCategory').value = book.subCategory || '';
        document.getElementById('bookDescription').value = book.bookDescription || '';
        document.getElementById('bookAuthor').value = book.bookAuthor || '';
        document.getElementById('language').value = book.language || '';
        document.getElementById('bookPublicDate').value = book.bookPublicDate || '';
        document.getElementById('bookRate').value = book.bookRate || '';
        document.getElementById('bookStatue').value = book.bookStatue || '';
        document.getElementById('bookPrice').value = book.bookPrice || '';
        document.getElementById('bookDiscount').value = book.bookDiscount || '';
        document.getElementById('bookPricediscount').value = book.bookPricediscount || '';
        document.getElementById('bookKey').value = bookId; // To track updates
    });
}




// To fetch and display data in the table
function displayBooks() {
    const bookDataTable = document.getElementById('bookDataBody');
    bookDataTable.innerHTML = ''; // Clear existing rows

    contactFormDB.on('child_added', function (snapshot) {
        const book = snapshot.val();
        const bookId = snapshot.key;
        const row = document.createElement('tr');

        // Generate table row
        row.innerHTML = `
            <td>${book.bookName || ''}</td>
            <td>${book.category || ''}</td>
            <td>${book.subCategory || ''}</td>
            <td title="${book.bookDescription || ''}">
                ${book.bookDescription ? book.bookDescription.substring(0, 5) + (book.bookDescription.length > 5 ? '...' : '') : ''}
            </td>
            <td>${book.bookAuthor || ''}</td>
            <td>${book.language || ''}</td>
            <td>${book.bookPublicDate || ''}</td>
            <td>${book.bookRate || ''}</td>
            <td>${book.bookStatue || ''}</td>
            <td>${book.bookPrice || ''}</td>
            <td>${book.bookDiscount || ''}</td>
            <td>${book.bookPricediscount || ''}</td>
            <td>${book.imageUrl ? `<img src="${book.imageUrl}" alt="Image" width="50" height="50">` : "N/A"}</td>
            <td>
                ${book.pdfUrl ? `<a href="${book.pdfUrl}" target="_blank">View PDF</a>` : 'N/A'}
            </td>
             <td>${book.mediaUrl ? `<a href="${book.mediaUrl}" target="_blank">View Media</a>` : "N/A"}</td>
        `;

        // Prepend the new row to the table
        bookDataTable.prepend(row);
   

        // Add click event with highlighting
        addRowClickEvent(row, book, bookId);
    });
}




// Handle delete button click
document.getElementById('deleteBtn').addEventListener('click', function () {
    const bookKey = document.getElementById('bookKey').value;

    if (!bookKey) {
        alert("No book selected to delete.");
        return;
    }

    console.log('Book ID to delete:', bookKey);  // Log to check if bookKey is correct
    deleteBook(bookKey);  // Call delete function
});

// Delete a book from Firebase Realtime Database and Storage
function deleteBook(bookId) {
    const bookRef = contactFormDB.child(bookId);

    bookRef.once('value').then((snapshot) => {
        const book = snapshot.val();

        if (!book) {
            console.log("No book data found with ID:", bookId);
            alert("No book found with the provided ID.");
            return;
        }

        console.log("Book data found:", book);

        // 🖼️ Delete all image files from Storage
        if (Array.isArray(book.imageUrl)) {
            book.imageUrl.forEach((imgUrl) => {
                if (typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
                    const imgRef = storage.refFromURL(imgUrl);
                    imgRef.delete()
                        .then(() => console.log("Image deleted from Storage:", imgUrl))
                        .catch((error) => console.error("Error deleting image:", imgUrl, error));
                }
            });
        } else {
            console.log("No images to delete.");
        }

        // 📄 Delete the PDF file from Storage
        if (book.pdfUrl && typeof book.pdfUrl === 'string' && book.pdfUrl.startsWith('http')) {
            const pdfRef = storage.refFromURL(book.pdfUrl);
            pdfRef.delete()
                .then(() => console.log("PDF deleted from Storage:", book.pdfUrl))
                .catch((error) => console.error("Error deleting PDF:", error));
        } else {
            console.log("No PDF to delete.");
        }

        // 🗑️ Delete book data from Realtime Database
        bookRef.remove()
            .then(() => {
                alert("Book and associated files deleted successfully!");
                clearForm();
                displayBooks();  // Refresh the table to reflect the deleted book
            })
            .catch((error) => {
                console.error("Error deleting book from Realtime Database:", error);
                alert("Error deleting book. Please try again.");
            });

    }).catch((error) => {
        console.error("Error fetching book data:", error);
        alert("Error fetching book data. Please try again.");
    });
}

// // Refresh the books table to reflect the deletion
// function refreshBooksTable() {
//     // Call your displayBooks function to refresh the table
//     displayBooks();
// }


function rows(){
    const row = document.createElement('tr');

                row.innerHTML = `
              <td>${book.bookName || ''}</td>
            <td>${book.category || ''}</td>
            <td>${book.subCategory || ''}</td>
            <td title="${book.bookDescription || ''}">
                ${book.bookDescription ? book.bookDescription.substring(0, 5) + (book.bookDescription.length > 5 ? '...' : '') : ''}
            </td>

            <td>${book.bookAuthor || ''}</td>
            <td>${book.bookAuthor || ''}</td>
            <td>${book.language || ''}</td>
            <td>${book.bookRate || ''}</td>
            <td>${book.bookStatue || ''}</td>
            <td>${book.bookPrice || ''}</td>
            <td>${book.bookDiscount || ''}</td>
            <td>${book.bookPricediscount || ''}</td>
            <td>${book.imageUrl ? `<img src="${book.imageUrl}" alt="Image" width="50" height="50">` : "N/A"}</td>
            <td>
                ${book.pdfUrl ? `<a href="${book.pdfUrl}" target="_blank">View PDF</a>` : 'N/A'}
            </td>
             <td>${book.mediaUrl ? `<a href="${book.mediaUrl}" target="_blank">View Media</a>` : "N/A"}</td>
        `;
}


// Handle update button click
document.getElementById('updateBtn').addEventListener('click', function () {
    const bookKey = document.getElementById('bookKey').value;

    if (!bookKey) {
        alert("No book selected to update.");
        return;
    }

    // Ensure updateBook is called only once
    updateBook(bookKey);
});


async function updateBook(bookKey) {
    if (!bookKey) {
        alert("Invalid book selection.");
        return;
    }

    // Get updated input values
    const bookName = document.getElementById('bookName').value;
    const category = document.getElementById('category').value;
    const subCategory = document.getElementById('subCategory').value;
    const bookDescription = document.getElementById('bookDescription').value;
    const bookAuthor = document.getElementById('bookAuthor').value;
    const language = document.getElementById('language').value;
    const bookPublicDate = document.getElementById('bookPublicDate').value;
    const bookRate = document.getElementById('bookRate').value;
    const bookStatue = document.getElementById('bookStatue').value;
    const bookPrice = document.getElementById('bookPrice').value;
    const bookDiscount = document.getElementById('bookDiscount').value;
    const bookPricediscount = document.getElementById('bookPricediscount').value;
    const imageFiles = document.getElementById('uploadImage').files;
    const pdfFile = document.getElementById('uploadPDF').files[0];
    const mediaFile = document.getElementById('uploadMedia').files[0];

    let updatedData = {
        bookName,
        category,
        subCategory,
        bookDescription,
        bookAuthor,
        language,
        bookPublicDate,
        bookRate,
        bookStatue,
        bookPrice,
        bookDiscount,
        bookPricediscount
    };

    console.log('Updated Data:', updatedData); // Log updated data to check values

    try {
        // Fetch existing data from Firebase
        const bookRef = contactFormDB.child(bookKey);
        const snapshot = await bookRef.once("value");
        const bookData = snapshot.val();

        console.log('Fetched Book Data:', bookData); // Log fetched data to verify

        if (!bookData) {
            alert("Book not found.");
            return;
        }
// Handle images: if no new images are uploaded, delete the old ones and upload new ones
if (imageFiles.length > 0) {
    let newImageURLs = "";

    // Delete old images if they exist
    if (bookData.imageUrl && typeof bookData.imageUrl === "string" && bookData.imageUrl !== "") {
        try {
            const oldImageRef = storage.refFromURL(bookData.imageUrl);
            await oldImageRef.delete();
        } catch (error) {
            console.error("Error deleting old image: ", error);
        }
    }

    // Upload new image (just the first one)
    const imageFile = imageFiles[0];
    if (!imageFile.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
    }

    const imageSnapshot = await storage.ref(`images/${bookKey}_${imageFile.name}`).put(imageFile);
    const imageUrl = await imageSnapshot.ref.getDownloadURL();
    newImageURLs = imageUrl;

    updatedData.imageUrl = newImageURLs;
} else {
    // Preserve old image URL if no new one is uploaded
    updatedData.imageUrl = bookData.imageUrl || "";
}

// Handle PDF: if a new PDF is uploaded, delete the old one and upload the new one
let newPdfURL = "";

if (pdfFile) {
    // Validate the PDF file type
    if (pdfFile.type !== 'application/pdf') {
        alert("Please upload a valid PDF file.");
        return;
    }

    // Attempt to delete the old PDF if the URL is valid
    if (
        bookData.pdfUrl &&
        typeof bookData.pdfUrl === "string" &&
        bookData.pdfUrl.startsWith("https://firebasestorage.googleapis.com")
    ) {
        try {
            const oldPdfRef = storage.refFromURL(bookData.pdfUrl);
            await oldPdfRef.delete();
        } catch (error) {
            console.error("Error deleting old PDF:", error?.message || error);
        }
    }

    // Upload the new PDF
    try {
        const pdfSnapshot = await storage.ref(`pdfs/${bookKey}_${pdfFile.name}`).put(pdfFile);
        newPdfURL = await pdfSnapshot.ref.getDownloadURL();
        updatedData.pdfUrl = newPdfURL;
    } catch (error) {
        console.error("Error uploading new PDF:", error?.message || error);
        alert("Failed to upload new PDF. Please try again.");
        return;
    }
}


// Handle media: if no new media is uploaded, delete the old one and upload new one
let newMediaURL = "";
if (mediaFile) {
    if (bookData.mediaUrl && typeof bookData.mediaUrl === "string" && bookData.mediaUrl !== "") {
        try {
            const oldMediaRef = storage.refFromURL(bookData.mediaUrl);
            await oldMediaRef.delete();
        } catch (error) {
            console.error("Error deleting old media: ", error);
        }
    }

    const mediaSnapshot = await storage.ref(`medias/${bookKey}_${mediaFile.name}`).put(mediaFile);
    newMediaURL = await mediaSnapshot.ref.getDownloadURL();

    updatedData.mediaUrl = newMediaURL; // ✅ Only set if uploaded
}


console.log('Updated Data for Firebase:', updatedData); // Log final updated data before updating Firebase

// Update book data in the database
await bookRef.update(updatedData);

alert("Book successfully updated!");

// Refresh the data table to show the updated record
displayBooks();

// Clear the form after updating
clearForm();


    } catch (error) {
        console.error("Error updating book: ", error);
        alert("Error updating book. Please try again.");
    }
}

function showSuccessMessage() {
    const msg = document.getElementById("successMessage");
    msg.style.display = "block";
    setTimeout(() => {
        msg.style.display = "none";
    }, 3000); // Hide after 3 seconds
}

//////////////////////////////////////////////////////////////////////////

// Add New Button functionality
document.getElementById("addNewBtn").addEventListener("click", function () {
    // Reset the form fields
    document.getElementById("bookForm").reset();

    // Clear the hidden key field to avoid updating existing records
    document.getElementById("bookKey").value = "";

    // Optionally focus on the first input field for better UX
    document.getElementById("bookName").focus();

    // Show a confirmation alert for the user
    alert("Form cleared. You can now add a new record.");
});


//////////////////////////////////////////////////////////////////////////

// Handle search input
document.getElementById('searchInput').addEventListener('input', function () {
    const searchText = this.value.trim().toLowerCase();
    searchBooks(searchText);
});

// Function to search books based on input text
function searchBooks(searchText) {
    const bookDataTable = document.getElementById('bookDataBody');
    bookDataTable.innerHTML = ''; // Clear table before displaying search results

    if (!searchText) {
        // If searchText is empty, display all books
        displayBooks(); // This function should display all books without filtering
        return;
    }

    contactFormDB.once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const book = childSnapshot.val();
            const bookId = childSnapshot.key;

            // Convert book data into a string to check for searchText
            const bookString = `
                ${book.bookName} ${book.category} ${book.subCategory} ${book.description} 
                ${book.author} ${book.publicationDate} ${book.rate} ${book.statue} 
                ${book.price} ${book.discount} ${book.priceDiscount}
            `.toLowerCase();

            if (bookString.includes(searchText)) {
                const row = document.createElement('tr');

                row.innerHTML = `
              <td>${book.bookName || ''}</td>
            <td>${book.category || ''}</td>
            <td>${book.subCategory || ''}</td>
             <td title="${book.bookDescription || ''}">
                ${book.bookDescription ? book.bookDescription.substring(0, 5) + (book.bookDescription.length > 5 ? '...' : '') : ''}
            </td>
            <td>${book.bookAuthor || ''}</td>
            <td>${book.language || ''}</td>
            <td>${book.bookPublicDate || ''}</td>
            <td>${book.bookRate || ''}</td>
            <td>${book.bookStatue || ''}</td>
            <td>${book.bookPrice || ''}</td>
            <td>${book.bookDiscount || ''}</td>
            <td>${book.bookPricediscount || ''}</td>
            <td>${book.imageUrl ? `<img src="${book.imageUrl}" alt="Image" width="50" height="50">` : "N/A"}</td>
            <td>
                ${book.pdfUrl ? `<a href="${book.pdfUrl}" target="_blank">View PDF</a>` : 'N/A'}
            </td>
             <td>${book.mediaUrl ? `<a href="${book.mediaUrl}" target="_blank">View Media</a>` : "N/A"}</td>
        `;

                // Insert the new row at the top
                bookDataTable.insertBefore(row, bookDataTable.firstChild);

                // Add click event for the row
                addRowClickEvent(row, book, bookId);

                // Add click event to populate form for editing
                row.addEventListener('click', function () {
                    document.getElementById('bookName').value = book.bookName;
                    document.getElementById('category').value = book.category;
                    document.getElementById('subCategory').value = book.subCategory;
                    document.getElementById('bookDescription').value = book.bookDescription;
                    document.getElementById('bookAuthor').value = book.bookAuthor;
                    document.getElementById('language').value = book.language;
                    document.getElementById('bookPublicDate').value = book.bookPublicDate;
                    document.getElementById('bookRate').value = book.bookRate;
                    document.getElementById('bookStatue').value = book.bookStatue;
                    document.getElementById('bookPrice').value = book.bookPrice;
                    document.getElementById('bookDiscount').value = book.bookDiscount;
                    document.getElementById('bookPricediscount').value = book.bookPricediscount;

                    // Set the hidden bookKey field to the book ID
                    document.getElementById('bookKey').value = bookId;
                });
            }
        });
    });
}


//////////////////////////////////////////////////////////////////////////

// Call displayBooks on page load to populate the table
displayBooks();

function refreshBooksTable() {
    const bookDataTable = document.getElementById('bookDataBody');

    // Clear the current table data
    bookDataTable.innerHTML = '';

    // Fetch and display the data again from Firebase
    contactFormDB.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const book = childSnapshot.val();
            const bookId = childSnapshot.key;

            const row = document.createElement('tr');
            row.setAttribute('data-book-id', bookId);

            // Generate media preview (e.g., audio/video)
            const mediaHTML = book.mediaUrl 
                ? `<a href="${book.mediaUrl}" target="_blank">View Media</a>`
                : 'N/A';

            row.innerHTML = `
             <td>${book.bookName || ''}</td>
            <td>${book.category || ''}</td>
            <td>${book.subCategory || ''}</td>
            <td title="${book.bookDescription || ''}">
                ${book.bookDescription ? book.bookDescription.substring(0, 5) + (book.bookDescription.length > 5 ? '...' : '') : ''}
            </td>
            <td>${book.bookAuthor || ''}</td>
            <td>${book.language || ''}</td>
            <td>${book.bookPublicDate || ''}</td>
            <td>${book.bookRate || ''}</td>
            <td>${book.bookStatue || ''}</td>
            <td>${book.bookPrice || ''}</td>
            <td>${book.bookDiscount || ''}</td>
            <td>${book.bookPricediscount || ''}</td>
            <td>${book.imageUrl ? `<img src="${book.imageUrl}" alt="Image" width="50" height="50">` : "N/A"}</td>
            <td>
                ${book.pdfUrl ? `<a href="${book.pdfUrl}" target="_blank">View PDF</a>` : 'N/A'}
            </td>
             <td>${book.mediaUrl ? `<a href="${book.mediaUrl}" target="_blank">View Media</a>` : "N/A"}</td>
        `;

            // Insert the new row at the top
            bookDataTable.insertBefore(row, bookDataTable.firstChild);

            // Add click event
            addRowClickEvent(row, book, bookId);
        });
    });
}
