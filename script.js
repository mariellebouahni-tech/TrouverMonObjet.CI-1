const BASE_ID = "appgjdmev9eCzBhHs";
const TOKEN = "patu5c585Dw4l7ho5.7be32ef312c3c01aac505afbd607429767d4eb445dc248f83529c72b9f4f0c76";

let imagesProduit = [];
let imageActuelle = 0;
if (
    window.location.pathname.includes("dashboard.html") ||
    window.location.pathname.includes("ajouter-produit.html")
) {
    if (!localStorage.getItem("vendeurEmail")) {
        window.location.href = "vendeur.html";
    }
}

// =======================
// Publier un produit
// =======================
  async function publierProduit(event) {

    if (event) event.preventDefault();

    console.log("BOUTON PUBLIER CLIQUÉ");

    const input = document.getElementById("images");

    if (!input) {
        alert("Le champ image est introuvable.");
        return;
    }

    const images = input.files;

    // idProduit est récupéré ici directement
    const params = new URLSearchParams(window.location.search);
    const idProduit = params.get("id");

    // Image obligatoire uniquement pour un nouveau produit
    if (!idProduit && images.length === 0) {
        alert("Veuillez choisir au moins une image.");
        return;
    }

    const vendeurEmail = localStorage.getItem("vendeurEmail");

    if (!vendeurEmail) {
        alert("Aucun vendeur connecté.");
        window.location.href = "vendeur.html";
        return;
    }

    let imageUrls = [];

    try {

        // =========================
        // UPLOAD DES IMAGES
        // =========================

        for (let i = 0; i < images.length; i++) {

            const formData = new FormData();
            formData.append("image", images[i]);

            console.log("Upload image", i + 1);

            const reponseImage = await fetch(
                "https://api.imgbb.com/1/upload?key=fe9b72e946ea1fb27e166a5acd916586",
                {
                    method: "POST",
                    body: formData
                }
            );

            const resultat = await reponseImage.json();

            console.log("Réponse ImgBB :", resultat);

            if (!resultat.success) {
                alert("Erreur lors de l'envoi de l'image.");
                return;
            }

            imageUrls.push(resultat.data.url);
        }

        // =========================
        // RÉCUPÉRATION DU PRODUIT
        // =========================

console.log("TEST CHAMPS :");
console.log("nom :", document.getElementById("nom"));
console.log("catégorie :", document.getElementById("catégorie"));
console.log("prix :", document.getElementById("prix"));
console.log("boutique :", document.getElementById("boutique"));
console.log("adresse :", document.getElementById("adresse"));
console.log("telephone :", document.getElementById("telephone"));
console.log("ville :", document.getElementById("ville"));
console.log("description :", document.getElementById("description"));
console.log("promotion :", document.getElementById("promotion"));
console.log("prixPromotionnel :", document.getElementById("prixPromotionnel"));
console.log("finPromotion :", document.getElementById("finPromotion"));
console.log("stock :", document.getElementById("stock"));
console.log("ancienPrix :", document.getElementById("ancienPrix"));


        const produit = {
          
            Email: vendeurEmail,

            nom: document.getElementById("nom").value.trim(),

            catégorie: document.getElementById("catégorie").value,

            prix: Number(document.getElementById("prix").value),

            boutique: document.getElementById("boutique").value.trim(),

            adresse: document.getElementById("adresse").value.trim(),

            Telephone: document.getElementById("telephone").value.trim(),

            ville: document.getElementById("ville").value.trim(),

            description: document.getElementById("description").value.trim(),

            "En promotion":
                document.getElementById("promotion").checked,

            "Prix promotionnel":
                Number(document.getElementById("prixPromotionnel").value) || null,

            "Fin de promotion":
                document.getElementById("finPromotion").value || null,

            stock:
                document.getElementById("stock").value
                    ? Number(document.getElementById("stock").value)
                    : null,

            ancienPrix:
                Number(document.getElementById("ancienPrix").value) || null
        };

        // Ajouter les nouvelles images seulement s'il y en a
        if (imageUrls.length > 0) {
            produit.images = imageUrls.map(url => ({
                url: url
            }));
        }

        console.log("Produit envoyé :", produit);

        // =========================
        // AIRTABLE
        // =========================

        const url = idProduit
            ? `https://api.airtable.com/v0/${BASE_ID}/Produits/${idProduit}`
            : `https://api.airtable.com/v0/${BASE_ID}/Produits`;

        const reponse = await fetch(url, {

            method: idProduit ? "PATCH" : "POST",

            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                fields: produit
            })
        });

        const resultat = await reponse.json();

        console.log("Réponse Airtable :", resultat);

        if (!reponse.ok) {

            alert(
                "Erreur Airtable :\n" +
                JSON.stringify(resultat, null, 2)
            );

            return;
        }

        alert(
            idProduit
                ? "✅ Produit modifié avec succès !"
                : "✅ Produit publié avec succès !"
        );

        window.location.href = "dashboard.html";

    } catch (erreur) {

        console.error("Erreur publierProduit :", erreur);

        alert(
            "Une erreur est survenue :\n" +
            erreur.message
        );
    }
}
// =======================
// Inscription vendeur
// =======================
async function inscrireVendeur(event) {
    event.preventDefault();

    const motdepasse = document.getElementById("motdepasse").value;
    const confirmation =document.getElementById("confirmation").value;



    if (motdepasse !== confirmation) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    const vendeur = {
    "Nom de la boutique": document.getElementById("boutique").value,
    "Nom du responsable": document.getElementById("responsable").value,
    "Telephone": document.getElementById("telephone").value,
    "Ville": document.getElementById("ville").value,
    "Email": document.getElementById("email").value,
    "Mot de passe": motdepasse
};

    try {
     const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Vendeurs`, {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: vendeur })
});

const texte = await reponse.text();

console.log("Code :", reponse.status);
console.log("Réponse :", texte);

if (!reponse.ok) {
    alert("Erreur : " + texte);
    return;
}

localStorage.setItem("vendeurEmail", vendeur.Email);

alert("Inscription réussie !");
window.location.assign("./dashboard.html");

    } catch (e) {
        console.log(e);
        alert(e.message);
    }

}// =======================
// Connexion vendeur
// =======================
async function connexionVendeur() {

    const email = document.getElementById("email").value.trim();
    const motdepasse = document.getElementById("motdepasse").value;

    if (!email || !motdepasse) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    try {

        const reponse = await fetch(
            `https://api.airtable.com/v0/${BASE_ID}/Vendeurs?filterByFormula={Email}="${email}"`,
            {
                headers: {
                    "Authorization": `Bearer ${TOKEN}`
                }
            }
        );

        const data = await reponse.json();

        const vendeur = data.records.find(v =>
            v.fields["Mot de passe"] === motdepasse
        );

        if (vendeur) {
            localStorage.setItem("vendeurEmail", email);
            alert("Connexion réussie !");
            window.location.href = "dashboard.html";
        } else {
            alert("Email ou mot de passe incorrect.");
        }

    } catch (e) {
        console.log(e);
        alert("Impossible de se connecter.");
    }
}

// =======================
// Rechercher un produit
// =======================
async function chercher() {
  
  document.getElementById("titrePopulaires").style.display = "none";
document.getElementById("produitsAccueil").style.display = "none";

document.getElementById("titreResultats").style.display = "flex";
document.getElementById("resultats").style.display = "block";
  
  const populaires = document.getElementById("produitsPopulaires");
if (populaires) populaires.style.display = "none";

const accueil = document.getElementById("produitsAccueil");
if (accueil) accueil.style.display = "none";

const recommandes = document.getElementById("produitsRecommandes");
if (recommandes) recommandes.style.display = "none";

    const texte = document.getElementById("recherche").value.trim().toLowerCase();
    localStorage.setItem("derniereRecherche", texte);
const ville = document.getElementById("rechercheVille").value.trim().toLowerCase();

    try {

        const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits`, {
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            }
        });

        const data = await reponse.json();

        let html = "";

        const produits = data.records.filter(p => {

    const nom = (p.fields.nom || "").toLowerCase();
    const villeProduit = (p.fields.ville || "").toLowerCase();

    return nom.includes(texte) &&
           (ville === "" || villeProduit.includes(ville));

});

        if (produits.length === 0) {

            html = "<p>Aucun produit trouvé.</p>";

        } else {

            produits.sort((a, b) => (a.fields.prix || 0) - (b.fields.prix || 0));

            produits.forEach(p => {

html += `
<div class="carte">

<img src="${p.fields.images && p.fields.images[0] ? p.fields.images[0].url : ''}" alt="${p.fields.nom}">

<div class="infos">

${p.fields["En promotion"] ? '<div class="promo">💥 PROMO</div>' : ''}

<h3>${p.fields.nom}</h3>

<p class="prix">
${p.fields["En promotion"] ? p.fields["Prix promotion"] : p.fields.prix} FCFA
</p>

${p.fields["En promotion"] ?
`<p style="text-decoration:line-through;color:gray;">
${p.fields.prix} FCFA
</p>` : ''}

<p class="ville">📍 ${p.fields.ville || ""}</p>

<p class="boutique">🏪 ${p.fields.boutique || ""}</p>

<div class="actions">

<button class="btn btnOrange"
onclick="window.location.href='details.html?id=${p.id}'">
Voir
</button>

<button class="btn btnBlanc"
onclick="ajouterFavori('${p.id}', this)">
❤️
</button>

</div>

</div>

</div>
`;

});

        }

        document.getElementById("resultats").innerHTML = html;

    } catch (e) {
        console.log(e);
        alert(e.message);
    }

}// =======================
// Afficher les produits (Mes Produits)
// =======================
async function chargerProduits() {
    const liste = document.getElementById("listeProduits");

    if (!liste) return;

    liste.innerHTML = "<p>Chargement des produits...</p>";

    try {

const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits`, {
    headers: {
        "Authorization": `Bearer ${TOKEN}`
    }
});

const data = await reponse.json();

const vendeurEmail = localStorage.getItem("vendeurEmail");

console.log("vendeur connecté :", vendeurEmail);
console.log("Produits Airtable :", data.records);

const produits = data.records.filter(p =>
    p.fields.Email === vendeurEmail
);

console.log("Emails des produits :", produits.map(p => p.fields.Email));

const reponseMessages = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Messages`, {
    headers: {
        "Authorization": `Bearer ${TOKEN}`
    }
});

const dataMessages = await reponseMessages.json();

        let html = "";

        produits.forEach(p => {

            html += `
<div class="carte">

    <img src="${p.fields.images && p.fields.images[0] ? p.fields.images[0].url : ""}"
     alt="${p.fields.nom}"
     style="width:100%;max-width:250px;border-radius:10px;margin-bottom:10px;">

    <h2>${p.fields.nom || ""}</h2>

    <p class="prix">${p.fields.prix || 0} FCFA</p>

    <p><strong>Boutique :</strong> ${p.fields.boutique || ""}</p>

    <p><strong>Ville :</strong> ${p.fields.ville || ""}</p>

    <p>${p.fields.description || ""}</p>
    
    <button class="modifier"
onclick="window.location.href='ajouter-produits.html?id=${p.id}'">
✏️ Modifier
</button>

<button class="details"
onclick="window.location.href='details.html?id=${p.id}'">
👁 Voir les détails
</button>

<button class="supprimer"
onclick="supprimerProduit('${p.id}')">
🗑 Supprimer
</button>

            </div>
            `;

        });

        liste.innerHTML = html;

    } catch (e) {
    console.log(e);
    alert(e.message);
    liste.innerHTML = "<p>Impossible de charger les produits.</p>";
}

}


// Charger automatiquement les produits à l'ouverture de la page
document.addEventListener("DOMContentLoaded", chargerProduits);

// Vérifier si on est en mode modification
const params = new URLSearchParams(window.location.search);
const idProduit = params.get("id");

if (idProduit && document.getElementById("nom")) {
    chargerProduit(idProduit);
}

async function chargerProduit(id) {

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits/${id}`, {
        headers: {
            "Authorization": `Bearer ${TOKEN}`
        }
    });

    const produit = await reponse.json();

    document.getElementById("titrePage").textContent = "Modifier le produit";
    document.getElementById("btnProduit").textContent = "Enregistrer les modifications";

    document.getElementById("nom").value = produit.fields.nom || "";
    document.getElementById("categorie").value = produit.fields.catégorie || "";
    document.getElementById("prix").value = produit.fields.prix || "";
    document.getElementById("boutique").value = produit.fields.boutique || "";
    document.getElementById("adresse").value = produit.fields.adresse || "";
    document.getElementById("telephone").value = produit.fields.Telephone || "";
    document.getElementById("ville").value = produit.fields.ville || "";
    document.getElementById("description").value = produit.fields.description || "";
}
async function supprimerProduit(id) {

    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) {
        return;
    }

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${TOKEN}`
        }
    });

    if (reponse.ok) {
        alert("Produit supprimé avec succès !");
        chargerProduits(); // Recharge la liste
    } else {
        const erreur = await reponse.json();
        console.log(erreur);
        alert("Erreur lors de la suppression.");
    }
}
async function chargerDetailsProduit() {

    const zone = document.getElementById("detailsProduit");

    if (!zone) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");


    if (!id) {
        zone.innerHTML = "<p>Produit introuvable.</p>";
        return;
    }

    try {

        const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits/${id}`, {
    headers: {
        "Authorization": `Bearer ${TOKEN}`
    }
});

if (!reponse.ok) {
    throw new Error("Erreur Airtable : " + reponse.status);
}

const p = await reponse.json();
const nouvellesVues = (p.fields.Vues || 0) + 1;

await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits/${id}`, {
    method: "PATCH",
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        fields: {
            Vues: nouvellesVues
        }
    })
});
const vendeurConnecte = localStorage.getItem("vendeurEmail");
const emailProduit = p.fields.Email || "";
const estMonProduit = 
    vendeurConnecte && 
    p.fields.Email && 
    vendeurConnecte.trim() === p.fields.Email.trim();
imagesProduit = p.fields.images || [];
imageActuelle = 0;
console.log(p);
        zone.innerHTML = `
           <div id="galerie" style="text-align:center;margin-bottom:20px;">

    <div style="display:flex;align-items:center;justify-content:center;gap:10px;">

        <button type="button" onclick="imagePrecedente()">⬅️</button>

        <img id="imagePrincipale"
             onclick="ouvrirImage(this.src)"
             src="${p.fields.images && p.fields.images.length > 0 ? p.fields.images[0].url : ""}"
             style="width:100%;max-width:350px;border-radius:10px;">

        <button type="button" onclick="imageSuivante()">➡️</button>

    </div>

    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px;">
        ${(p.fields.images || []).map(img => `
            <img src="${img.url}"
                 onclick="document.getElementById('imagePrincipale').src='${img.url}'"
                 style="width:70px;height:70px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid #F77F00;">
        `).join("")}
    </div>

</div>

            <h2>${p.fields.nom || ""}</h2>

${p.fields.ancienPrix && p.fields.ancienPrix > p.fields.prix ? `
    <p style="text-decoration:line-through;color:gray;font-size:16px;">
        ${p.fields.ancienPrix} FCFA
    </p>

    <p style="font-size:24px;font-weight:bold;color:#F77F00;">
        ${p.fields.prix} FCFA
    </p>

    <p style="color:green;font-weight:bold;">
        💰 Économie : ${p.fields.ancienPrix - p.fields.prix} FCFA
    </p>
` : `
    <p class="prix">${p.fields.prix || 0} FCFA</p>
`}

${p.fields.promotion && p.fields.finPromotion ? `
    <div id="compteRebours"
         style="background:#FFF3CD;
                border:2px solid #F77F00;
                padding:12px;
                border-radius:10px;
                margin:15px 0;
                text-align:center;
                font-weight:bold;">
        ⏳ Chargement...
    </div>
` : ""}

<p><strong>Catégorie :</strong> ${p.fields.catégorie || ""}</p>

            <p>
<strong>Boutique :</strong>
<a href="boutique.html?nom=${encodeURIComponent(p.fields.boutique || "")}"
   id="boutique"
   style="color:#F77F00;font-weight:bold;text-decoration:none;">
   ${p.fields.boutique || ""}
</a>
</p>
            <p><strong>Ville :</strong> ${p.fields.ville || ""}</p>

            <p><strong>Adresse :</strong> ${p.fields.adresse || ""}</p>

${(p.fields.Vues || 0) >= 100 ? `
<p style="color:#E65100;font-weight:bold;font-size:17px;">
🔥 Produit populaire • 👀 ${p.fields.Vues} vues
</p>
` : `
<p style="color:#555;font-weight:bold;">
👀 ${p.fields.Vues || 0} vues
</p>
`}

${p.fields.stock === undefined || p.fields.stock === "" ? `` :
(Number(p.fields.stock) === 0 ? `
<p style="color:red;font-weight:bold;">
🔴 Rupture de stock
</p>
` : (Number(p.fields.stock) <= 10 ? `
<p style="color:#F77F00;font-weight:bold;">
🟠 Stock faible : ${p.fields.stock} disponible(s)
</p>
` : `
<p style="color:green;font-weight:bold;">
🟢 En stock : ${p.fields.stock} disponible(s)
</p>
`))}
            <p><strong>Description :</strong><br>${p.fields.description || ""}</p>

           <p><strong>Téléphone :</strong> ${p.fields.Telephone || ""}</p>

${!estMonProduit ? `
<button onclick="window.location.href='tel:${p.fields.Telephone || ""}'">
📞 Contacter le vendeur
</button>

<button onclick="location.href='https://wa.me/225${(p.fields.Telephone || "").replace(/\D/g, "")}?text=${encodeURIComponent("Bonjour, je suis intéressé par votre produit : " + (p.fields.nom || ""))}'">
💬 Contacter sur WhatsApp
</button>

<button onclick="ouvrirChat()">
💬 Discuter dans l'application
</button>
` : `
<button onclick="window.location.href='ajouter-produit.html?id=${p.id}'">
✏️ Modifier mon produit
</button>
`}

${estMonProduit ? `
<button onclick="window.location.href='avis.html?id=${p.id}'">
⭐ Voir les avis
</button>
` : `
<button onclick="laisserAvis()">
⭐ Laisser un avis
</button>
`}

<button onclick="history.back()">
⬅ Retour
</button>

<div id="resumeAvis" style="
margin-top:20px;
padding:15px;
background:#FFF8E6;
border-radius:10px;
text-align:center;
font-size:20px;
font-weight:bold;
">
⭐ Chargement des avis...
</div>

            <div style="
margin-top:20px;
padding:15px;
background:#FFF8E6;
border:2px solid #F77F00;
border-radius:10px;">

<h3 style="color:#F77F00;">🛡️ Conseils de sécurité</h3>

<p>• Vérifiez le produit avant de payer.</p>

<p>• N'envoyez jamais d'argent avant d'avoir reçu votre colis.</p>

<p>• Méfiez-vous des offres trop belles pour être vraies.</p>

<p>• Rencontrez le vendeur dans un lieu sûr lorsque c'est possible.</p>

</div>  `;
await chargerAvis();

    } catch (e) {
    console.error(e);
    alert(e.message);
    zone.innerHTML = "<p>Impossible de charger le produit.</p>";
}
}
document.addEventListener("DOMContentLoaded", chargerDetailsProduit);

function deconnexionVendeur() {
    localStorage.removeItem("vendeurEmail");
    alert("Vous êtes déconnecté.");
    window.location.href = "vendeur.html";
}

async function ajouterFavori(idProduit, bouton) {

    const email = localStorage.getItem("acheteurEmail");

    if (!email) {
        alert("Veuillez vous connecter.");
        return;
    }

    // Vérifier si le produit est déjà en favori
    const verifier = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Favoris`, {
        headers: {
            "Authorization": `Bearer ${TOKEN}`
        }
    });

    const data = await verifier.json();

    const dejaFavori = data.records.some(f =>
        f.fields.Email === email &&
        f.fields.Produits &&
        f.fields.Produits.includes(idProduit)
    );

    if (dejaFavori) {
        alert("❤️ Ce produit est déjà dans vos favoris.");
        return;
    }

    const favori = {
        Email: email,
        Produits: [idProduit]
    };

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Favoris`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: favori
        })
    });

    if (reponse.ok) {
      
      console.log("Bouton reçu :", bouton);

    bouton.style.backgroundColor = "#F77F00";
bouton.style.color = "white";

    alert("❤️ Produit ajouté aux favoris !");

} else {

    const erreur = await reponse.json();
    console.log(erreur);
    alert("Erreur lors de l'ajout aux favoris.");

}
}

async function chargerFavoris() {

    const zone = document.getElementById("listeFavoris");

    if (!zone) return;

    const email = localStorage.getItem("acheteurEmail");

    const reponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Favoris?filterByFormula={Email}="${email}"`,
        {
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            }
        }
    );

    const data = await reponse.json();

    let html = "";

    for (const f of data.records) {

    const idProduit = f.fields.Produits[0];

    const reponseProduit = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Produits/${idProduit}`,
        {
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            }
        }
    );

    const p = await reponseProduit.json();
    console.log(p.fields.image);

    html += `
<div class="carteFavori">

    <img class="imageFavori"
    src="${p.fields.images && p.fields.images[0] ? p.fields.images[0].url : ""}">

    <div class="contenuFavori">

        <div class="nomFavori">
            ❤️ ${p.fields.nom}
        </div>

        <div class="prixFavori">
            ${p.fields.prix} FCFA
        </div>

        <div class="infoFavori">
            📍 ${p.fields.ville || ""}
        </div>

        <div class="infoFavori">
            🏪 ${p.fields.boutique || ""}
        </div>

        <div class="actionsFavori">

            <button class="btnVoir"
            onclick="window.location.href='details.html?id=${p.id}'">
                👁 Voir
            </button>

            <button class="btnSupprimer"
            onclick="supprimerFavori('${f.id}')">
                🗑 Retirer
            </button>

        </div>

    </div>

</div>
`;
zone.innerHTML = html || `
<div style="text-align:center;padding:40px;">
<h2>❤️ Aucun favori</h2>
<p>Ajoutez des produits à vos favoris pour les retrouver ici.</p>
</div>`;
}
zone.innerHTML = html || "<p>Aucun favori.</p>";
}
document.addEventListener("DOMContentLoaded", chargerFavoris);

async function supprimerFavori(idFavori) {

    if (!confirm("Retirer ce produit des favoris ?")) {
        return;
    }

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Favoris/${idFavori}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${TOKEN}`
        }
    });

    if (reponse.ok) {
        alert("Favori supprimé !");
        chargerFavoris();
    } else {
        alert("Erreur lors de la suppression.");
    }
}

// =======================
// Charger le profil vendeur
// =======================

async function chargerProfil() {

    const email = localStorage.getItem("vendeurEmail");

    if (!email) {
        window.location.href = "vendeur.html";
        return;
    }

    const reponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Vendeurs?filterByFormula={Email}="${email}"`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        }
    );

    const data = await reponse.json();

    if (data.records.length > 0) {

        const vendeur = data.records[0].fields;

        document.getElementById("boutique").value = vendeur.Boutique || "";
        document.getElementById("responsable").value = vendeur.Responsable || "";
        document.getElementById("telephone").value = vendeur.Téléphone || "";
        document.getElementById("email").value = vendeur.Email || "";
        document.getElementById("adresse").value = vendeur.Adresse || "";
    }
}


// =======================
// Modifier le profil vendeur
// =======================

async function modifierProfil(){

    const email = localStorage.getItem("vendeurEmail");

    const reponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Vendeurs?filterByFormula={Email}="${email}"`,
        {
            headers:{
                Authorization:`Bearer ${TOKEN}`
            }
        }
    );

    const data = await reponse.json();

    if(data.records.length === 0){
        alert("Profil introuvable");
        return;
    }

    const id = data.records[0].id;


    await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Vendeurs/${id}`,
        {
            method:"PATCH",
            headers:{
                Authorization:`Bearer ${TOKEN}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                fields:{
                    Boutique: document.getElementById("boutique").value,
                    Responsable: document.getElementById("responsable").value,
                    Téléphone: document.getElementById("telephone").value,
                    Adresse: document.getElementById("adresse").value
                }
            })
        }
    );

    alert("Profil modifié avec succès !");
}


// Charger automatiquement si on est sur profil.html
if(window.location.pathname.includes("profil.html")){
    chargerProfil();
}

async function chargerProfil(){

    const email = localStorage.getItem("vendeurEmail");

    if(!email){
        window.location.href = "vendeur.html";
        return;
    }

    document.getElementById("email").value = email;

    const reponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Vendeurs?filterByFormula={Email}="${email}"`,
        {
            headers:{
                Authorization:`Bearer ${TOKEN}`
            }
        }
    );

    const data = await reponse.json();

    if(data.records.length > 0){

        const vendeur = data.records[0].fields;

        document.getElementById("boutique").value = vendeur["Nom de la boutique"] || "";
document.getElementById("responsable").value = vendeur["Nom du responsable"] || "";
document.getElementById("telephone").value = vendeur["Telephone"] || "";
document.getElementById("ville").value = vendeur["Ville"] || "";
document.getElementById("email").value = vendeur["Email"] || "";
document.getElementById("motdepasse").value = vendeur["Mot de passe"] || "";
document.getElementById("adresse").value = vendeur["Adresse de la boutique"] || "";
    }
}


if(window.location.pathname.includes("profil.html")){
    chargerProfil();
}

async function laisserAvis() {

    const acheteur = prompt("Votre nom :");
    if (!acheteur) return;

    const note = prompt("Donnez une note de 1 à 5 :");
    if (!note || note < 1 || note > 5) {
        alert("La note doit être comprise entre 1 et 5.");
        return;
    }

    const commentaire = prompt("Votre commentaire :");

    const avis = {
        Vendeur: document.getElementById("boutique").textContent,
        Acheteur: acheteur,
        Note: Number(note),
        Commentaire: commentaire,
        Date: new Date().toISOString().split("T")[0]
    };

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Avis`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: avis
        })
    });

    if (reponse.ok) {
        alert("⭐ Merci ! Votre avis a été enregistré.");
    } else {
        alert("Erreur lors de l'enregistrement de l'avis.");
    }
}

async function chargerAvis() {

    const boutique = document.getElementById("boutique").textContent.trim();
console.log("Boutique :", boutique);
    const resume = document.getElementById("resumeAvis");

    if (!resume) return;

    const reponse = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/Avis`,
    {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    }
);

const data = await reponse.json();
console.log(data.records);

    if (data.records.length === 0) {
        resume.innerHTML = "⭐ Aucun avis pour le moment.";
        return;
    }

    let total = 0;
    let htmlAvis = "";

    data.records.forEach(a => {

        total += a.fields.Note || 0;

        const etoiles = "⭐".repeat(a.fields.Note || 0);

        htmlAvis += `
            <div style="background:#fff;padding:10px;margin:10px 0;border-radius:10px;">
                <strong>${a.fields.Acheteur}</strong><br>
                ${etoiles} (${a.fields.Note}/5)<br>
                <em>${a.fields.Commentaire || "Aucun commentaire"}</em><br>
                <small>${a.fields.Date || ""}</small>
            </div>
        `;
    });

    const moyenne = (total / data.records.length).toFixed(1);

    resume.innerHTML = `
    <h3>⭐ ${moyenne}/5</h3>
    <p>(${data.records.length} avis)</p>

    <button onclick="toggleAvis()" id="btnAvis">
        Voir les avis
    </button>

    <div id="listeAvis" style="display:none;margin-top:15px;">
        ${htmlAvis}
    </div>
`;
}

async function partagerProduit() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: "Trouver Mon Objet CI",
                text: "Regarde ce produit sur Trouver Mon Objet CI",
                url: window.location.href
            });
        } catch (e) {
            console.log("Partage annulé");
        }
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Le lien a été copié.");
    }
}

function ouvrirImage(src) {

    const fond = document.createElement("div");

    fond.style = `
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:rgba(0,0,0,0.9);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:9999;
    `;

    fond.innerHTML = `
        <img src="${src}"
             style="max-width:95%;max-height:95%;border-radius:10px;">
    `;

    fond.onclick = function () {
        fond.remove();
    };

    document.body.appendChild(fond);
}

function imageSuivante() {
    if (imagesProduit.length === 0) return;

    imageActuelle = (imageActuelle + 1) % imagesProduit.length;
    document.getElementById("imagePrincipale").src = imagesProduit[imageActuelle].url;
}

function imagePrecedente() {
    if (imagesProduit.length === 0) return;

    imageActuelle--;
    if (imageActuelle < 0) {
        imageActuelle = imagesProduit.length - 1;
    }

    document.getElementById("imagePrincipale").src = imagesProduit[imageActuelle].url;
}

function ouvrirChat() {
    const params = new URLSearchParams(window.location.search);
    const idProduit = params.get("id");
    window.location.href = `chat.html?produit=${idProduit}`;
}



async function envoyerMessage() {
  try {
  
    const texte = document.getElementById("message").value.trim();

    if (!texte) {
        alert("Écrivez un message.");
        return;
    }
    
    const maintenant = new Date();

const heure = maintenant.toLocaleString("fr-FR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
});

    const params = new URLSearchParams(window.location.search);
const idProduit = params.get("produit");
const acheteurConnecte =
    localStorage.getItem("acheteurEmail") || params.get("acheteur");

    const produitReponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Produits/${idProduit}`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        }
    );

    const produitData = await produitReponse.json();

const emailVendeur = produitData.fields.Email;

   const vendeurConnecte = localStorage.getItem("vendeurEmail");

let destinataire;

if (vendeurConnecte) {
    if (!acheteurConnecte) {
        alert("Erreur : aucun acheteur sélectionné.");
        return;
    }
    destinataire = acheteurConnecte;
} else {
    destinataire = emailVendeur;
}
const monEmail = vendeurConnecte || acheteurConnecte;

const message = {
    Produit: idProduit,
    Expediteur: monEmail,
    Destinataire: destinataire,
    Acheteur: acheteurConnecte,
    Vendeur: emailVendeur,
    Message: texte,
    Date: new Date().toISOString(),
    Lu: false
};


    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: message
        })
    });

    if (!reponse.ok) {
    const erreur = await reponse.json();
    console.log(erreur);
    alert(JSON.stringify(erreur));
    return;
}

console.log({
    Utilisateur: destinataire,
    Titre: "💬 Nouveau message",
    Message: vendeurConnecte
        ? "Le vendeur vous a répondu."
        : "Un acheteur vous a envoyé un message.",
    Lu: false,
    Date: new Date().toISOString(),
    Lien: `chat.html?produit=${idProduit}`
});
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/Conversations`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: {
    Produit: idProduit,
    Acheteur: acheteurConnecte,
    Vendeur: emailVendeur,
    "Dernier message": texte,
    Date: new Date().toISOString()
}
        })
    });

    document.getElementById("message").value = "";
    alert("Message envoyé !");
    console.log({
    Utilisateur: destinataire,
    Titre: "💬 Nouveau message",
    Message: vendeurConnecte
        ? "Le vendeur vous a répondu."
        : "Un acheteur vous a envoyé un message.",
    Lu: false,
    Date: new Date().toISOString(),
    Lien: `chat.html?produit=${idProduit}&acheteur=${encodeURIComponent(acheteurConnecte)}`
});
console.log("Destinataire de la notification :", destinataire);
console.log("Vendeur connecté :", vendeurConnecte);
console.log("Acheteur connecté :", acheteurConnecte);
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/Notifications`, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        fields: {
    Utilisateur: destinataire,
    Titre: "💬 Nouveau message",
    Message: vendeurConnecte
        ? "Le vendeur vous a répondu."
        : "Un acheteur vous a envoyé un message.",
    Lu: false,
    Date: new Date().toISOString(),
    Lien: `chat.html?produit=${idProduit}&acheteur=${encodeURIComponent(acheteurConnecte)}`
}
   })
});
} catch (erreur) {
    console.error(erreur);
    alert(erreur.message);
}
}
    

async function chargerMessages() {
  
    const params = new URLSearchParams(window.location.search);
const idProduit = params.get("produit");

    const reponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Messages?filterByFormula={Produit}="${idProduit}"`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        }
    );

    const data = await reponse.json();
    
    const monEmail =
    localStorage.getItem("vendeurEmail") ||
    localStorage.getItem("acheteurEmail");

// Marquer les messages reçus comme lus
for (const m of data.records) {

    if (m.fields.Destinataire === monEmail && !m.fields.Lu) {

        await fetch(
            `https://api.airtable.com/v0/${BASE_ID}/Messages/${m.id}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fields: {
                        Lu: true
                    }
                })
            }
        );
    }
}

    const zone = document.getElementById("messages");
    if (!zone) return;
    
    data.records.sort((a, b) =>
    new Date(a.fields.Date) - new Date(b.fields.Date)
);

    let html = "";

    data.records.forEach(m => {
        
const estMoi = m.fields.Expediteur === monEmail;

html += `
<div class="${estMoi ? 'messageMoi' : 'messageAutre'}">
${m.fields.Message}
</div>
display:flex;
justify-content:${estMoi ? "flex-end" : "flex-start"};
margin-bottom:10px;
">

<div style="
max-width:75%;
padding:10px;
border-radius:15px;
background:${estMoi ? "#F77F00" : "#FFFFFF"};
color:${estMoi ? "white" : "black"};
">

${m.fields.Message}

</div>

</div>
`;
    });

    zone.innerHTML = html || "Aucun message.";
}

async function chargerConversations() {

    const zone = document.getElementById("listeConversations");

    if (!zone) return;

    const email = localStorage.getItem("vendeurEmail") || "Acheteur";

    try {

        const reponse = await fetch(
            `https://api.airtable.com/v0/${BASE_ID}/Conversations`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        const data = await reponse.json();

        const conversations = data.records.filter(c =>
            c.fields.Acheteur === email ||
            c.fields.Vendeur === email
        );

        if (conversations.length === 0) {
            zone.innerHTML = "<p>Aucune conversation.</p>";
            return;
        }

        let html = "";

        for (const c of conversations) {

    const produitReponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Produits/${c.fields.Produit}`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        }
    );

    const produitData = await produitReponse.json();
    console.log("Conversation :", c.fields);
console.log("Fields :", produitData.fields);
    const nomProduit = produitData.fields.nom;

    html += `
<div class="conversation"
onclick="window.location.href='chat.html?produit=${c.fields.Produit}&acheteur=${encodeURIComponent(c.fields.Acheteur)}'">

<h3>📦 ${nomProduit}</h3>

<p>${c.fields["Dernier message"] || ""}</p>

<small>${c.fields.Date || ""}</small>

</div>
`;
}

zone.innerHTML = html;

} catch (e) {

    console.error(e);
    alert(e.message);
    zone.innerHTML = "<p>Erreur de chargement.</p>";

}
}
document.addEventListener("DOMContentLoaded", chargerConversations);

async function chargerNotifications() {

    const zone = document.getElementById("listeNotifications");
    const badge = document.getElementById("nbNotifications");

    const utilisateur =
    localStorage.getItem("vendeurEmail") ||
    localStorage.getItem("acheteurEmail");

    const reponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Notifications`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        }
    );

    const data = await reponse.json();
    
    console.log("Utilisateur connecté :", utilisateur);
console.log("Toutes les notifications :", data.records);

    data.records.forEach(n => {
    console.log(n.fields);
});

const notifications = data.records.filter(n =>
    n.fields.Utilisateur === utilisateur
);

    if (badge) {
        badge.textContent = notifications.filter(n => !n.fields.Lu).length;
    }

    if (!zone) return;

    if (notifications.length === 0) {
        zone.innerHTML = "<p>Aucune notification.</p>";
        return;
    }

    let html = "";

    notifications.forEach(n => {
    html += `
        <div class="notification ${n.fields.Lu ? '' : 'nonLu'}"
             onclick="ouvrirNotification('${n.id}','${n.fields.Lien}')">

            <h3>${n.fields.Titre}</h3>

            <p>${n.fields.Message}</p>

        </div>
    `;
});

    zone.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", chargerNotifications);

async function chargerProduitsAccueil() {

    const zone = document.getElementById("produitsAccueil");
    if (!zone) return;

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });

    const data = await reponse.json();

    let html = "";

    
data.records.slice(0,10).forEach(p=>{

html += `
<div class="carte" onclick="window.location.href='details.html?id=${p.id}'">

<img src="${p.fields.images && p.fields.images[0] ? p.fields.images[0].url : ''}" alt="${p.fields.nom}">

<div class="infos">

<div class="promo">Nouveau</div>

<h3>${p.fields.nom || ""}</h3>

<p class="prix">${p.fields.prix || 0} FCFA</p>

<p class="ville">📍 ${p.fields.ville || ""}</p>

<p class="boutique">🏪 ${p.fields.boutique || ""}</p>

<div class="actions">

<button class="btn btnOrange">
Voir
</button>

<button class="btn btnBlanc"
onclick="event.stopPropagation(); ajouterFavori('${p.id}', this)">
❤️
</button>

</div>

</div>

</div>
`;
});

    zone.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", chargerProduitsAccueil);

function afficherPromotion() {

    const coche = document.getElementById("promotion").checked;

    document.getElementById("zonePromotion").style.display =
        coche ? "block" : "none";
}

async function chargerProduitsPopulaires() {

    const zone = document.getElementById("produitsPopulaires");
    if (!zone) return;

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });

    const data = await reponse.json();

    const produits = data.records
        .sort((a, b) => (b.fields.Vues || 0) - (a.fields.Vues || 0))
        .slice(0, 10);

    let html = "";

    produits.forEach(p => {

        html += `
        <div class="carte"
             onclick="window.location.href='details.html?id=${p.id}'">

            <img src="${p.fields.images && p.fields.images[0] ? p.fields.images[0].url : ""}"
                 style="width:100%;height:120px;object-fit:cover;border-radius:10px;">

            <h4>${p.fields.nom}</h4>

            <p style="color:#F77F00;font-weight:bold;">
                ${p.fields.prix} FCFA
            </p>

            <small>👁 ${p.fields.Vues || 0} vues</small>

        </div>
        `;
    });

    zone.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", chargerProduitsPopulaires);

async function chargerProduitsRecommandes() {

    const zone = document.getElementById("produitsRecommandes");
    if (!zone) return;

    const recherche = (localStorage.getItem("derniereRecherche") || "").toLowerCase();

    if (recherche === "") {
        zone.innerHTML = "<p>Effectuez une recherche pour recevoir des recommandations.</p>";
        return;
    }

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });

    const data = await reponse.json();

    const produits = data.records.filter(p =>
        (p.fields.nom || "").toLowerCase().includes(recherche)
    );

    let html = "";

    produits.forEach(p => {

        html += `
        <div class="carte"
             onclick="window.location.href='details.html?id=${p.id}'">

            <img src="${p.fields.images && p.fields.images[0] ? p.fields.images[0].url : ""}"
                 style="width:100%;height:120px;object-fit:cover;border-radius:10px;">

            <h4>${p.fields.nom}</h4>

            <p style="color:#F77F00;font-weight:bold;">
                ${p.fields.prix} FCFA
            </p>

        </div>
        `;
    });

    zone.innerHTML = html || "<p>Aucune recommandation disponible.</p>";
}

document.addEventListener("DOMContentLoaded", chargerProduitsRecommandes);

async function chargerBoutique() {

    const zone = document.getElementById("produitsBoutique");
    if (!zone) return;

    const nomBoutique = new URLSearchParams(window.location.search).get("nom");

    document.getElementById("nomBoutique").textContent = nomBoutique;

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });

    const data = await reponse.json();

    const produits = data.records.filter(p =>
        p.fields.boutique === nomBoutique
    );

    let html = "";

    produits.forEach(p => {

        html += `
        <div class="carte"
             onclick="window.location.href='details.html?id=${p.id}'">

            <img src="${p.fields.images && p.fields.images[0] ? p.fields.images[0].url : ""}"
                 style="width:100%;height:140px;object-fit:cover;border-radius:10px;">

            <h3>${p.fields.nom}</h3>

            <p style="color:#F77F00;font-weight:bold;">
                ${p.fields.prix} FCFA
            </p>

        </div>
        `;

    });

    zone.innerHTML = html || "<p>Aucun produit dans cette boutique.</p>";
}

document.addEventListener("DOMContentLoaded", chargerBoutique);

function toggleAvis() {
    const liste = document.getElementById("listeAvis");
    const bouton = document.getElementById("btnAvis");

    if (liste.style.display === "none") {
        liste.style.display = "block";
        bouton.textContent = "Masquer les avis";
    } else {
        liste.style.display = "none";
        bouton.textContent = "Voir les avis";
    }
}

async function inscrireAcheteur(event) {
    event.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const telephone = document.getElementById("telephone").value.trim();
    const email = document.getElementById("email").value.trim();
    const motdepasse = document.getElementById("motdepasse").value;
    const confirmation = document.getElementById("confirmation").value;

    if (motdepasse !== confirmation) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Acheteurs`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: {
                Nom: nom,
                Telephone: telephone,
                Email: email,
                "Mot de passe": motdepasse,
                "Date": new Date().toISOString()
            }
        })
    });

    if (!reponse.ok) {
    const erreur = await reponse.json();
    console.log(erreur);
    alert(JSON.stringify(erreur));
    return;
}

    localStorage.setItem("acheteurEmail", email);

    alert("Inscription réussie !");

    window.location.href = "acheteur.html";
}

async function connecterAcheteur(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const motdepasse = document.getElementById("motdepasse").value;

    const reponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Acheteurs?filterByFormula=AND({Email}="${email}",{Mot de passe}="${motdepasse}")`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });

    const data = await reponse.json();

    if (data.records.length === 0) {
        alert("Email ou mot de passe incorrect.");
        return;
    }

    localStorage.setItem("acheteurEmail", email);

    alert("Connexion réussie !");

    window.location.href = "acheteur.html";
}

async function chargerStatistiques() {

    if (!window.location.pathname.includes("dashboard.html")) return;

    const vendeurEmail = localStorage.getItem("vendeurEmail");

    try {

        const reponseProduits = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Produits`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        const dataProduits = await reponseProduits.json();

        const produits = dataProduits.records.filter(p =>
            p.fields.Email === vendeurEmail
        );

        document.getElementById("nbProduits").textContent = produits.length;

        const totalVues = produits.reduce((total, p) =>
            total + (Number(p.fields.Vues) || 0), 0);

        document.getElementById("nbVues").textContent = totalVues;

        const reponseMessages = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Messages`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        const dataMessages = await reponseMessages.json();

        const nbMessages = dataMessages.records.filter(m =>
            m.fields.Destinataire === vendeurEmail
        ).length;

        document.getElementById("nbMessages").textContent = nbMessages;

    } catch (e) {
        console.log(e);
    }
}

document.addEventListener("DOMContentLoaded", chargerStatistiques);

function deconnexionAcheteur(){

localStorage.removeItem("acheteurEmail");

window.location.href="connexion-acheteur.html";

}

async function chargerProfilAcheteur() {

    const email = localStorage.getItem("acheteurEmail");

    if (!email) {
        alert("Aucun acheteur connecté.");
        return;
    }

    const reponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Acheteurs?filterByFormula={Email}="${email}"`,
        {
            headers:{
                Authorization:`Bearer ${TOKEN}`
            }
        }
    );

    const data = await reponse.json();

    if (data.records.length === 0) {
        alert("Profil introuvable.");
        return;
    }

    const acheteur = data.records[0].fields;

    document.getElementById("nom").value = acheteur.Nom || "";
document.getElementById("email").value = acheteur.Email || "";
document.getElementById("telephone").value = acheteur.Telephone || "";
console.log(acheteur);
console.log("Ville :", acheteur.Ville);
document.getElementById("ville").value = acheteur.Ville || "";
document.getElementById("motdepasse").value = acheteur["Mot de passe"] || "";

}

async function modifierProfilAcheteur(event){

    event.preventDefault();

    const emailActuel = localStorage.getItem("acheteurEmail");

    const reponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Acheteurs?filterByFormula={Email}="${emailActuel}"`,
        {
            headers:{
                Authorization:`Bearer ${TOKEN}`
            }
        }
    );

    const data = await reponse.json();

    if(data.records.length === 0){
        alert("Profil introuvable");
        return;
    }

    const id = data.records[0].id;


    await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Acheteurs/${id}`,
        {
            method:"PATCH",
            headers:{
                Authorization:`Bearer ${TOKEN}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                fields:{
    Nom: document.getElementById("nom").value,
    Email: document.getElementById("email").value,
    Ville: document.getElementById("ville").value,
    Telephone: document.getElementById("telephone").value,
    "Mot de passe": document.getElementById("motdepasse").value
                }
            })
        }
    );


    localStorage.setItem(
        "acheteurEmail",
        document.getElementById("email").value
    );


    alert("Profil modifié avec succès !");
}

async function filtrerCategorie(categorie, event) {

    const titrePopulaires = document.getElementById("titrePopulaires");
    const produitsAccueil = document.getElementById("produitsAccueil");
    const titreResultats = document.getElementById("titreResultats");
    const resultats = document.getElementById("resultats");

    if (titrePopulaires) titrePopulaires.style.display = "none";
    if (produitsAccueil) produitsAccueil.style.display = "none";
    if (titreResultats) titreResultats.style.display = "flex";
    if (resultats) resultats.style.display = "block";

    const produitsPopulaires = document.getElementById("produitsPopulaires");
    if (produitsPopulaires) produitsPopulaires.style.display = "none";

    const produitsRecommandes = document.getElementById("produitsRecommandes");
    if (produitsRecommandes) produitsRecommandes.style.display = "none";

    // Mettre la catégorie sélectionnée en orange
    if (event) {
        document.querySelectorAll(".categorie").forEach(c => {
            c.classList.remove("active");
        });

        const bouton = event.target.closest(".categorie");

        if (bouton) {
            bouton.classList.add("active");
        }
    }

    console.log("Catégorie sélectionnée :", categorie);

    try {

        const reponse = await fetch(
            `https://api.airtable.com/v0/${BASE_ID}/Produits`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        if (!reponse.ok) {
            throw new Error("Erreur Airtable : " + reponse.status);
        }

        const data = await reponse.json();

        console.log("Produits récupérés :", data.records);

        const produits = data.records.filter(p => {

            const cat = (p.fields.catégorie || "")
                .trim()
                .toLowerCase();

            return cat === categorie.trim().toLowerCase();

        });

        console.log("Produits de la catégorie :", produits);

        let html = "";

        if (produits.length === 0) {

            html = "<p>Aucun produit dans cette catégorie.</p>";

        } else {

            produits.forEach(p => {

                html += `
                <div class="carte">

                    <img
                        src="${p.fields.images && p.fields.images[0]
                            ? p.fields.images[0].url
                            : ""}"
                        alt="${p.fields.nom || ""}"
                    >

                    <div class="infos">

                        <h3>${p.fields.nom || ""}</h3>

                        <p class="prix">
                            ${p.fields.prix || 0} FCFA
                        </p>

                        <p class="ville">
                            📍 ${p.fields.ville || ""}
                        </p>

                        <p class="boutique">
                            🏪 ${p.fields.boutique || ""}
                        </p>

                        <div class="actions">

                            <button
                                class="btn btnOrange"
                                onclick="window.location.href='details.html?id=${p.id}'">
                                Voir
                            </button>

                            <button
                                class="btn btnBlanc"
                                onclick="ajouterFavori('${p.id}', this)">
                                ❤️
                            </button>

                        </div>

                    </div>

                </div>
                `;

            });

        }

        if (resultats) {
            resultats.innerHTML = html;
        }

    } catch (e) {

        console.error("Erreur filtrage :", e);

        if (resultats) {
            resultats.innerHTML =
                "<p>Impossible de charger les produits.</p>";
        }

    }
}

function afficherToutesCategories() {

    const categories = document.querySelector(".categories");

    if (!categories) return;

    // Évite de créer les boutons plusieurs fois
    if (document.getElementById("categoriesSupplementaires")) {
        document.getElementById("categoriesSupplementaires").remove();
        return;
    }

    const zone = document.createElement("div");
    zone.id = "categoriesSupplementaires";

    zone.style.display = "flex";
    zone.style.gap = "10px";
    zone.style.overflowX = "auto";
    zone.style.padding = "10px 0";
    zone.style.flexWrap = "wrap";

    const autresCategories = [
        "Électronique",
        "Électroménager",
        "Chaussures",
        "Beauté",
        "Meubles",
        "Alimentation",
        "Automobile",
        "Bricolage",
        "Livres",
        "Jouets",
        "Autres"
    ];

    autresCategories.forEach(categorie => {

        const bouton = document.createElement("button");

        bouton.textContent = categorie;

        bouton.className = "categorie";

        bouton.onclick = function(event) {
            filtrerCategorie(categorie, event);
        };

        zone.appendChild(bouton);
    });

    categories.parentNode.insertBefore(
        zone,
        categories.nextSibling
    );
}