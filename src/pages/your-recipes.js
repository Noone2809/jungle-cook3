
import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "firebase/auth";
import {
    initializeRecipes,
    getRecipes,
    deleteRecipe
} from "../data/recipeStore.js";

export default function yourRecipes() {
    return `
        <div class="your-recipes" id="yourRecipesPage">
            <h2 id="recipesGreeting">Your Recipes</h2>
            <p id="recipesMessage" role="status" aria-live="polite">Loading your recipes...</p>
            <div id="recipeGrid" class="recipe-grid"></div>
        </div>
    `;
}

export async function init() {
    const page = document.querySelector("#yourRecipesPage");
    if (!page) return;

    const message = page.querySelector("#recipesMessage");
    const recipeGrid = page.querySelector("#recipeGrid");

    const user = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            unsubscribe();
            resolve(currentUser);
        });
    });

    const greeting = page.querySelector("#recipesGreeting");
    greeting.textContent = `Hey ${user.displayName?.split(" ")[0] || "there"}, here are your recipes!`;

    try {
        await initializeRecipes(user.uid);
        displayRecipes(getRecipes(user.uid));
    } catch (error) {
        console.error("Could not load recipes:", error);
        message.textContent = error.message || "Could not load your recipes.";
    }

    function displayRecipes(recipes) {
        recipeGrid.innerHTML = "";
        message.textContent = "";

        if (!recipes.length) {
            showEmptyState();
            return;
        }

        recipes.forEach((recipe) => {
            const card = document.createElement("div");
            card.className = "recipe-card";

            const imageContainer = document.createElement("div");
            imageContainer.className = "recipe-image";

            if (recipe.image) {
                const image = document.createElement("img");
                image.src = recipe.image;
                image.alt = recipe.name || "Recipe image";
                imageContainer.appendChild(image);
            } else {
                imageContainer.classList.add("no-image");
                imageContainer.textContent = "No Recipe Image";
            }

            const viewButton = document.createElement("button");
            viewButton.className = "view-recipe";
            viewButton.type = "button";
            viewButton.textContent = "View";
            viewButton.addEventListener("click", () => {
                sessionStorage.setItem("viewRecipeId", recipe.id);
                window.location.hash = "#recipe-view";
            });
            imageContainer.appendChild(viewButton);

            const information = document.createElement("div");
            information.className = "recipe-info";

            const name = document.createElement("h3");
            name.textContent = recipe.name || "Untitled Recipe";

            const description = document.createElement("p");
            description.textContent = recipe.description || "";

            const minutes = Number(recipe.totalTime) || 0;
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;

            const time = document.createElement("p");
            time.textContent = ` ${hours ? `${hours}h ` : ""}${remainingMinutes}min`;

            const servings = document.createElement("p");
            servings.textContent = ` ${recipe.servingSize || 0} servings`;

            information.append(name, description, time, servings);

            const actions = document.createElement("div");
            actions.className = "recipe-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "edit-recipe";
            editButton.textContent = "Edit Recipe";
            editButton.addEventListener("click", () => {
                sessionStorage.setItem("editRecipeId", recipe.id);
                window.location.hash = "#create-recipe";
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-recipe";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                if (!window.confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
                    return;
                }

                try {
                    deleteRecipe(user.uid, recipe.id);
                    card.remove();

                    if (!recipeGrid.querySelector(".recipe-card")) {
                        showEmptyState();
                    }
                } catch (error) {
                    console.error("Could not delete recipe:", error);
                    alert(error.message || "Could not delete this recipe.");
                }
            });

            actions.append(editButton, deleteButton);
            card.append(imageContainer, information, actions);
            recipeGrid.appendChild(card);
        });
    }

    function showEmptyState() {
        message.textContent = "";

        recipeGrid.innerHTML = `
            <div class="no-recipes">
                <h3>Your cookbook is empty!</h3>
                <p>Start adding your favorite recipes.</p>
                <button type="button" id="createRecipeLink">Create Recipe</button>
            </div>
        `;

        page.querySelector("#createRecipeLink").addEventListener("click", () => {
            window.location.hash = "#create-recipe";
        });
    }
}
