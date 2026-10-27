let users = []
let deleteIndex = null

const LOW_STOCK = 5

if (localStorage.getItem("users")) {
    users = JSON.parse(localStorage.getItem("users"))
}

const productBox = new bootstrap.Modal(productModal)
const deleteBox = new bootstrap.Modal(deleteModal)

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users))
}

function safe(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}


function money(amount) {
    return "₹" + amount.toLocaleString("en-IN")
}

displayUserList()

userForm.addEventListener('submit', (event) => {
    event.preventDefault()

    productId.value = productId.value.trim()
    username.value = username.value.trim()

    const editIndex = editStatus.value
    if (productId.value == "" || username.value == "" || category.value == "" || price.value == "" || quantity.value == "") {
        alert("Please fill the form completely")
        return
    }

    if (Number(price.value) < 0) {
        alert("Price cannot be negative")
        return
    }

    if (Number(quantity.value) < 0 || !Number.isInteger(Number(quantity.value))) {
        alert("Quantity must be a positive whole number")
        return
    }
    if (isNaN(productId.value) || Number(productId.value) < 0 || !Number.isInteger(Number(productId.value))) {
        alert("Product ID must be a positive whole number")
        return
    }
    let duplicate = false
    users.forEach((item, index) => {
        if (item.productId.toLowerCase() == productId.value.toLowerCase() && String(index) !== editIndex) {
            duplicate = true
        }
    })

    if (duplicate) {
        alert("This Product ID already exists")
        return
    }


    const data = {
        productId: productId.value,
        username: username.value,
        category: category.value,
        price: Number(price.value),
        quantity: Number(quantity.value)
    }

    if (editIndex === "") {
        users.push(data)
    } else {
        users[parseInt(editIndex)] = data
    }

    saveUsers()
    productBox.hide()
    displayUserList()
})


function openAdd() {
    userForm.reset()
    userForm.classList.remove("was-validated")
    editStatus.value = ""
    modalTitle.textContent = "Add Product"
    saveBtn.textContent = "Add Product"
    productBox.show()
}

function editUser(userIndex) {
    const userDetails = users[userIndex]
    userForm.classList.remove("was-validated")
    productId.setCustomValidity("")
    productId.value = userDetails.productId
    username.value = userDetails.username
    category.value = userDetails.category
    price.value = userDetails.price
    quantity.value = userDetails.quantity
    editStatus.value = userIndex

    modalTitle.textContent = "Edit Product"
    saveBtn.textContent = "Update Product"
    productBox.show()
}

searchInput.addEventListener('input', displayUserList)
filterCategory.addEventListener('change', displayUserList)
sortSelect.addEventListener('change', displayUserList)

function displayUserList() {
    let stock = 0
    let value = 0
    let low = 0
    users.forEach((item) => {
        stock += Number(item.quantity)
        value += Number(item.price) * Number(item.quantity)
        if (Number(item.quantity) < LOW_STOCK) {
            low++
        }
    })
    totalProducts.textContent = users.length
    totalStock.textContent = stock
    totalValue.textContent = money(value)
    lowStock.textContent = low

    const searchTerm = searchInput.value.trim().toLowerCase()
    const filterCat = filterCategory.value

    let rows = users.map((item, index) => ({ item: item, index: index }))

    rows = rows.filter((row) => {
        const matchesSearch = row.item.username.toLowerCase().includes(searchTerm)
        const matchesCategory = filterCat === "" || row.item.category === filterCat
        return matchesSearch && matchesCategory
    })

    if (sortSelect.value == "name") {
        rows.sort((a, b) => a.item.username.localeCompare(b.item.username))
    } else if (sortSelect.value == "priceLow") {
        rows.sort((a, b) => a.item.price - b.item.price)
    } else if (sortSelect.value == "priceHigh") {

        rows.sort((a, b) => b.item.price - a.item.price)
    } else if (sortSelect.value == "qtyLow") {
        rows.sort((a, b) => a.item.quantity - b.item.quantity)
    }

    tableBody.innerHTML = ""

    if (rows.length == 0) {
        let message = "No products match your search."
        if (users.length == 0) {
            message = "No products yet. Click Add Product to start."
        }
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-body-secondary py-4">${message}</td></tr>`
        return
    }

    rows.forEach((row, position) => {
        const item = row.item

        let badge = ""
        if (Number(item.quantity) == 0) {
            badge = `<span class="badge text-bg-danger ms-2">Out of stock</span>`
        } else if (Number(item.quantity) < LOW_STOCK) {
            badge = `<span class="badge text-bg-warning ms-2">Low</span>`
        }

        tableBody.innerHTML += `
            <tr>
                <td>${position + 1}</td>
                <td>${safe(item.productId)}</td>
                <td>${safe(item.username)}</td>
                <td>${safe(item.category)}</td>
                <td>${money(Number(item.price))}</td>
                <td>${item.quantity} ${badge}</td>

                <td>
                    <button onclick="editUser(${row.index})" class="btn btn-warning btn-sm">Edit</button>
                    <button onclick="deleteUser(${row.index})" class="btn btn-danger btn-sm">Delete</button>
                </td>
            </tr>
        `
    })
}

function deleteUser(userIndex) {
    deleteIndex = userIndex
    deleteText.textContent = `Are you sure you want to delete "${users[userIndex].username}"?`
    deleteBox.show()
}
function confirmDelete() {
    if (deleteIndex === null) {
        return
    }

    users.splice(deleteIndex, 1)
    saveUsers()
    deleteIndex = null

    deleteBox.hide()
    displayUserList()
}

