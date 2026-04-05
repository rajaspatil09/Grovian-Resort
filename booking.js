const guestsSelect = document.getElementById("guests");
const totalPriceEl = document.getElementById("totalPrice");

function calculatePrice() {
  const guests = parseInt(guestsSelect.value);

  let price = 6000; // base price for up to 2 guests

  if (guests > 2) {
    const extraGuests = guests - 2;
    price += extraGuests * 2700;
  }

  totalPriceEl.innerText = "₹" + price;
}

guestsSelect.addEventListener("change", calculatePrice);

// Initial calculation
calculatePrice();
