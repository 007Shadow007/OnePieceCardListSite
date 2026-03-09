/*const cardGrid = document.querySelector(".card-grid");*/
const cardGrid = document.getElementById("cardGrid");
const popup = document.getElementById("cardPopup");

const popupImage = document.getElementById("popupImage");
const popupTitle = document.getElementById("popupTitle");
const popupCost = document.getElementById("popupCost");
const popupPower = document.getElementById("popupPower");
const popupCounter = document.getElementById("popupCounter");
const popupColor = document.getElementById("popupColor");
const popupType = document.getElementById("popupType");
const popupEffect = document.getElementById("popupEffect");
const popupAttribute = document.getElementById("popupAttribute");
const popupSet = document.getElementById("popupSet");
const popupId = document.getElementById("popupId");

let allCards = [];  // Seznam vseh kart

fetch("cards.json")
  .then((res) => res.json())
  .then((cards) => {
    console.log(cards);  // Preveri, če se karte uspešno naložijo
    allCards = cards;  // Shrani vse karte v seznam
    displayCards(cards);  // Prikaz vseh kart
  })
  .catch((error) => {
    console.error("Napaka pri nalaganju kart:", error);  // Preveri napake, če klic ne uspe
  });

// Prikaz kart v mreži
function displayCards(cards) {
  cardGrid.innerHTML = "";  // Počisti mrežo, preden jo napolnimo

  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");  // Dodaj razred 'card' za filtriranje
    cardDiv.classList.add("card-item");  // Dodaj razred za stilizacijo

    const img = document.createElement("img");
    img.src = card.image;
    img.alt = card.name;

    // Dodaj ime karte v div
    const cardName = document.createElement("div");
    cardName.classList.add("card-name");
    /*cardName.textContent = card.name;*/

    const cardId = document.createElement("div");
    cardId.classList.add("card-id");
    cardId.textContent = card.id;

    cardDiv.appendChild(img);
    cardDiv.appendChild(cardName);
    /*cardDiv.appendChild(cardId);*/
    
    // Dodaj klik dogodek za prikaz podrobnosti
    cardDiv.addEventListener("click", () => showCardDetails(card));

    cardGrid.appendChild(cardDiv);
  });
}

// Funkcija za iskanje kart
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');

searchInput.addEventListener('input', function () {
  const filter = searchInput.value.toLowerCase().trim();
  
  // Filtriraj karte glede na ime
  const filteredCards = allCards.filter(card => card.name.toLowerCase().includes(filter));
  
  displayCards(filteredCards);  // Ponovno prikažemo filtrirane karte

  // Posodobi število zadetkov
  const visibleCount = filteredCards.length;
  resultCount.textContent =
    filter === "" ? "Prikazujem vse karte" : `${visibleCount} rezultat${visibleCount !== 1 ? "i" : ""} najdeni`;
});

// Prikaz podrobnosti karte v popup oknu
function showCardDetails(card) {
  popupImage.src = card.image;
  popupTitle.textContent = card.name;
  popupCost.textContent = card.Cost;
  popupPower.textContent = card.Power;
  popupCounter.textContent = card.counter;
  popupColor.textContent = card.Color;
  popupType.textContent = card.Type;
  popupEffect.textContent = card.Effect;
  popupSet.textContent = card["Card Set(s)"];
  popupAttribute.textContent = card.Attribute || "–";
  popup.classList.remove("hidden");

  const cardIdElement = document.querySelector('.card-id');  // Poišči .card-id znotraj pop-up
  cardIdElement.textContent = card.id;

  /*popupId.textContent = card.id;*/

  popup.classList.remove("hidden");
}

// Zapiranje popup okna
function closePopup() {
  popup.classList.add("hidden");
}

window.addEventListener("click", function (e) {
  const content = document.querySelector(".popup-content");
  if (e.target === popup && !content.contains(e.target)) {
    closePopup();
  }
});


/*
const cardGrid = document.getElementById("cardGrid");
const popup = document.getElementById("cardPopup");

const popupImage = document.getElementById("popupImage");
const popupTitle = document.getElementById("popupTitle");
const popupCost = document.getElementById("popupCost");
const popupPower = document.getElementById("popupPower");
const popupCounter = document.getElementById("popupCounter");
const popupColor = document.getElementById("popupColor");
const popupType = document.getElementById("popupType");
const popupEffect = document.getElementById("popupEffect");
const popupAttribute = document.getElementById("popupAttribute");
const popupSet = document.getElementById("popupSet");

fetch("cards.json")
  .then((res) => res.json())
  .then((cards) => {
    cards.forEach((card) => {
      const img = document.createElement("img");
      img.src = card.image;
      img.alt = card.name;
      img.addEventListener("click", () => showCardDetails(card));
      cardGrid.appendChild(img);
    });
  });

function showCardDetails(card) {
    popupImage.src = card.image;
    popupTitle.textContent = card.name;
    popupCost.textContent = card.Cost;
    popupPower.textContent = card.Power;
    popupCounter.textContent = card.counter;
    popupColor.textContent = card.Color;
    popupType.textContent = card.Type;
    popupEffect.textContent = card.Effect;
    popupSet.textContent = card["Card Set(s)"];
    popupAttribute.textContent = card.Attribute || "–";
    popup.classList.remove("hidden");
}

function closePopup() {
  popup.classList.add("hidden");
}

window.addEventListener("click", function (e) {
    const content = document.querySelector(".popup-content");
    if (e.target === popup && !content.contains(e.target)) {
      closePopup();
    }
  });

    const searchInput = document.getElementById('searchInput');
    const resultCount = document.getElementById('resultCount');
  
  searchInput.addEventListener('input', function () {
    const filter = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.card');
    let visibleCount = 0;
  
    cards.forEach(card => {
      const nameElement = card.querySelector('.card-name');
      if (!nameElement) return;
  
      const name = nameElement.textContent.toLowerCase().trim();
      if (name.includes(filter)) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
  
    resultCount.textContent =
      filter === "" ? "Showing all cards" : `${visibleCount} result${visibleCount !== 1 ? "s" : ""} found`;
  });  

  */
  
