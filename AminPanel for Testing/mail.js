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
var contactFormDB = firebase.database().ref("TestingData");

// Reference to Firebase Storage
const storage = firebase.storage();

// Handle form submission
// Handle form submission
document.getElementById("bookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get input values
    const docType = document.getElementById('typedoc').value;
    const docNumber = document.getElementById('docnumber').value;
    const subject = document.getElementById('subject').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const startDate = document.getElementById('startd').value;
    const startTime = document.getElementById('sartt').value;
    const stopDate = document.getElementById('stopd').value;
    const stopTime = document.getElementById('stopt').value;
    const imageFiles = document.getElementById('imageURL').files;  // Multiple images
    const pdfFile = document.getElementById('pdfURL').files[0];

    // Show loading state
    const submitButton = document.querySelector("button[type='submit']");
    submitButton.innerText = "Uploading...";
    submitButton.disabled = true;

    let imageURLs = [];
    let pdfURL = "";

    try {
        // Validate required fields
        if (!docType || !docNumber || !subject || !category || !description || !startDate || !startTime || !stopDate || !stopTime) {
            alert("Please fill in all required fields.");
            submitButton.innerText = "Submit";
            submitButton.disabled = false;
            return;
        }

      // Upload multiple images to Firebase Storage and get URLs
if (imageFiles.length > 0) {
    for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        
        // Upload the image to Firebase Storage
        const imageSnapshot = await storage.ref(`image/${imageFile.name}`).put(imageFile);
        
        // Get the download URL for each image
        const imageURL = await imageSnapshot.ref.getDownloadURL();
        
        // Add each image URL to the array
        imageURLs.push(imageURL);
    }
    submitButton.innerText = "Submit";
            submitButton.disabled = false;
}


        // Upload PDF to Firebase Storage and get URL
        if (pdfFile) {
            if (pdfFile.type !== 'application/pdf') {
                alert("Please upload a valid PDF file.");
                return;
            }
            const pdfSnapshot = await storage.ref(`pdf/${pdfFile.name}`).put(pdfFile);
            pdfURL = await pdfSnapshot.ref.getDownloadURL();
            submitButton.innerText = "Submit";
            submitButton.disabled = false;
        }
        const cambodiaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" }));
        // Save data to Firebase Realtime Database
        const newBookRef = contactFormDB.push();
        newBookRef.set({
            docType,
            docNumber,
            subject,
            category,
            description,
            startDate,
            startTime,
            stopDate,
            stopTime,
            images: imageURLs,  // Store multiple image URLs
            pdf: pdfURL,
            updatedAt: cambodiaTime.toISOString()       // Store PDF URL
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
    document.getElementById('typedoc').value = '';
    document.getElementById('docnumber').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('startd').value = '';
    document.getElementById('sartt').value = '';
    document.getElementById('stopd').value = '';
    document.getElementById('stopt').value = '';
    document.getElementById('imageURL').value = '';  // Clear the file input
    document.getElementById('pdfURL').value = '';    // Clear the file input
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

// Modify existing row click event to include highlighting
function addRowClickEvent(row, book, bookId) {
    row.addEventListener('click', function () {
        // Highlight the selected row
        highlightRow(row);

        // Populate form fields
        document.getElementById('typedoc').value = book.docType;
        document.getElementById('docnumber').value = book.docNumber;
        document.getElementById('subject').value = book.subject;
        document.getElementById('category').value = book.category;
        document.getElementById('description').value = book.description;
        document.getElementById('startd').value = book.startDate;
        document.getElementById('sartt').value = book.startTime;
        document.getElementById('stopd').value = book.stopDate;
        document.getElementById('stopt').value = book.stopTime;

        // Set the hidden bookKey field to the book ID
        document.getElementById('bookKey').value = bookId;
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

        // Loop through images array and generate image elements
        const images = book.images || []; // Ensure it's an array
        const imageHTML = images.length > 0 
            ? images.map(imgUrl => `<img src="${imgUrl}" alt="Image" width="50" height="50">`).join(' ')
            : 'N/A'; // If no images, show "N/A"
        

        row.innerHTML = `
            <td>${book.docType}</td>
            <td>${book.docNumber}</td>
            <td>${book.category}</td>
            <td>${book.description}</td>
            <td>${book.subject}</td>
            <td>${book.startDate}</td>
            <td>${book.startTime}</td>
            <td>${book.stopDate}</td>
            <td>${book.stopTime}</td>
            <td>${imageHTML}</td>
            <td>
                ${book.pdf ? `<a href="${book.pdf}" target="_blank">View PDF</a>` : "N/A"}
            </td>
        `;

        // **Prepend instead of append**
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
        if (Array.isArray(book.images)) {
            book.images.forEach((imgUrl) => {
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
        if (book.pdf && typeof book.pdf === 'string' && book.pdf.startsWith('http')) {
            const pdfRef = storage.refFromURL(book.pdf);
            pdfRef.delete()
                .then(() => console.log("PDF deleted from Storage:", book.pdf))
                .catch((error) => console.error("Error deleting PDF:", error));
        } else {
            console.log("No PDF to delete.");
        }

        // 🗑️ Delete book data from Realtime Database
        bookRef.remove()
            .then(() => {
                alert("Book and associated files deleted successfully!");
                clearForm();
                refreshBooksTable();
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
    const docType = document.getElementById('typedoc').value;
    const docNumber = document.getElementById('docnumber').value;
    const subject = document.getElementById('subject').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const startDate = document.getElementById('startd').value;
    const startTime = document.getElementById('sartt').value;
    const stopDate = document.getElementById('stopd').value;
    const stopTime = document.getElementById('stopt').value;
    const imageFiles = document.getElementById('imageURL').files;  // Multiple images
    const pdfFile = document.getElementById('pdfURL').files[0];   // Single PDF file

    let updatedData = {
        docType,
        docNumber,
        subject,
        category,
        description,
        startDate,
        startTime,
        stopDate,
        stopTime
    };

    try {
        const bookRef = contactFormDB.child(bookKey);
        const snapshot = await bookRef.once("value");
        const bookData = snapshot.val();

        if (!bookData) {
            alert("Book not found.");
            return;
        }

        const oldImages = bookData.images || [];
        const oldPdf = bookData.pdf;

        // 1. Handle image upload ONLY if new images are selected
        let updatedImages = oldImages;
        if (imageFiles.length > 0) {
            // Delete old images from storage
            for (let i = 0; i < oldImages.length; i++) {
                const imageRef = storage.refFromURL(oldImages[i]);
                await imageRef.delete();
            }

            // Upload new images
            updatedImages = [];
            for (let i = 0; i < imageFiles.length; i++) {
                const imageFile = imageFiles[i];
                const imageSnapshot = await storage.ref(`image/${bookKey}_${imageFile.name}`).put(imageFile);
                const imageURL = await imageSnapshot.ref.getDownloadURL();
                updatedImages.push(imageURL);
            }
        }
        updatedData.images = updatedImages;

        // 2. Handle PDF upload ONLY if a new PDF is selected
        let updatedPdfURL = oldPdf;
        if (pdfFile) {
            if (pdfFile.type !== 'application/pdf') {
                alert("Please upload a valid PDF file.");
                return;
            }

            // Delete old PDF from storage
            if (oldPdf) {
                const pdfRef = storage.refFromURL(oldPdf);
                await pdfRef.delete();
            }

            // Upload new PDF
            const pdfSnapshot = await storage.ref(`pdf/${bookKey}_${pdfFile.name}`).put(pdfFile);
            updatedPdfURL = await pdfSnapshot.ref.getDownloadURL();
        }
        updatedData.pdf = updatedPdfURL;

        // 3. Update database
        await bookRef.update(updatedData);

        alert("Book successfully updated!");
        displayBooks();
        clearForm();

    } catch (error) {
        console.error("Error updating book: ", error);
        alert("Error updating book. Please try again.");
    }
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

    contactFormDB.once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const book = childSnapshot.val();
            const bookId = childSnapshot.key;

            // Convert book data into a string to check for searchText
            const bookString = `
                ${book.docType} ${book.docNumber} ${book.category} ${book.subject} 
                ${book.description} ${book.startDate} ${book.startTime} 
                ${book.stopDate} ${book.stopTime}
            `.toLowerCase();

            if (bookString.includes(searchText)) {
                const row = document.createElement('tr');

                const images = book.images || []; // Ensure it's an array
            const imageHTML = images.length > 0 
                ? images.map(imgUrl => `<img src="${imgUrl}" alt="Image" width="50" height="50">`).join(' ')
                : 'N/A'; // If no images, show "N/A"
                row.innerHTML = `
                    <td>${book.docType}</td>
                    <td>${book.docNumber}</td>
                    <td>${book.category}</td>
                    <td>${book.description}</td>
                    <td>${book.subject}</td>
                    <td>${book.startDate}</td>
                    <td>${book.startTime}</td>
                    <td>${book.stopDate}</td>
                    <td>${book.stopTime}</td>
                    <td>${imageHTML}</td>
                    <td>
                          ${book.pdf ? `<a href="${book.pdf}" target="_blank">View PDF</a>` : "N/A"}
                    </td>
                `;

            // Insert the new row at the top
            bookDataTable.insertBefore(row, bookDataTable.firstChild);

            // Add click event for the row
            addRowClickEvent(row, book, bookId);

                // Add click event to populate form for editing
                row.addEventListener('click', function () {
                    document.getElementById('typedoc').value = book.docType;
                    document.getElementById('docnumber').value = book.docNumber;
                    document.getElementById('subject').value = book.subject;
                    document.getElementById('category').value = book.category;
                    document.getElementById('description').value = book.description;
                    document.getElementById('startd').value = book.startDate;
                    document.getElementById('sartt').value = book.startTime;
                    document.getElementById('stopd').value = book.stopDate;
                    document.getElementById('stopt').value = book.stopTime;

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
            const bookId = childSnapshot.key;  // Get the unique ID of the book

            const row = document.createElement('tr');
            row.setAttribute('data-book-id', bookId); // Set data-book-id to uniquely identify the row

            // Loop through images array and generate image elements
            const images = book.images || []; // Ensure it's an array
            const imageHTML = images.length > 0 
                ? images.map(imgUrl => `<img src="${imgUrl}" alt="Image" width="50" height="50">`).join(' ')
                : 'N/A'; // If no images, show "N/A"
            
            row.innerHTML = `
                <td>${book.docType}</td>
                <td>${book.docNumber}</td>
                <td>${book.category}</td>
                <td>${book.description}</td>
                <td>${book.subject}</td>
                <td>${book.startDate}</td>
                <td>${book.startTime}</td>
                <td>${book.stopDate}</td>
                <td>${book.stopTime}</td>
                <td>${imageHTML}</td>
                <td>
                      ${book.pdf ? `<a href="${book.pdf}" target="_blank">View PDF</a>` : "N/A"}
                </td>
            `;

            // Insert the new row at the top
            bookDataTable.insertBefore(row, bookDataTable.firstChild);

            // Add click event for the row
            addRowClickEvent(row, book, bookId);
        });
    });
}


