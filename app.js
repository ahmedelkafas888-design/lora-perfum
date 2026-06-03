let cart = [];

function addToCart(name, price) {
cart.push({name, price});
alert(name + " added to cart");
renderCart();
}

function renderCart() {
let container = document.getElementById("cartItems");
container.innerHTML = "";

let total = 0;

cart.forEach(item => {
total += item.price;
container.innerHTML += `<p>${item.name} - ${item.price} EGP</p>`;
});

container.innerHTML += `<h3>Total: ${total} EGP</h3>`;
}

function sendWhatsApp() {
let name = document.getElementById("name").value;
let phone = document.getElementById("phone").value;
let city = document.getElementById("city").value;
let address = document.getElementById("address").value;

let msg = `New Order:
Name: ${name}
Phone: ${phone}
City: ${city}
Address: ${address}
Items: ${JSON.stringify(cart)}`;

let url = `https://wa.me/201208711729?text=${encodeURIComponent(msg)}`;

window.open(url);
}
