
import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "firebase/auth";

import {
    initializeRecipes,
    getRecipeById
} from "../data/recipeStore.js";

export default function recipeViewPage() {
    return `
        <div class="recipe-view" id="recipeViewPage">
            <p id="recipeViewMessage" role="status" aria-live="polite">
                Loading recipe...
            </p>
            <div id="recipeDetails"></div>
        </div>
    `;
}

export async function init() {
    const page = document.querySelector("#recipeViewPage");
    if (!page) return;

    const message = page.querySelector("#recipeViewMessage");
    const details = page.querySelector("#recipeDetails");

    const user = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            unsubscribe();
            resolve(currentUser);
        });
    });

    if (!user) {
        message.textContent = "Please log in to view this recipe.";
        return;
    }

    try {
        await initializeRecipes(user.uid);

        const recipeId = sessionStorage.getItem("viewRecipeId");

        if (!recipeId) {
            throw new Error("No recipe was selected.");
        }

        const recipe = getRecipeById(user.uid, recipeId);

        if (!recipe) {
            throw new Error("Recipe could not be found.");
        }

        message.textContent = "";

        const title = document.createElement("h2");
        title.textContent = recipe.name || "Untitled Recipe";

        if (recipe.image) {
            const image = document.createElement("img");
            image.src = recipe.image;
            image.alt = recipe.name || "Recipe image";
            image.className = "recipe-view-image";
            details.appendChild(image);
        }

        const descriptionTitle = document.createElement("h3");
        descriptionTitle.textContent = "Description:";

        const description = document.createElement("p");
        description.textContent = recipe.description || "";

        const timeTitle = document.createElement("h3");
        timeTitle.textContent = "Total Time:";

        const totalMinutes = Number(recipe.totalTime) || 0;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const time = document.createElement("p");

        if (hours > 0 && minutes > 0) {
            time.textContent = `${hours}h ${minutes}min`;
        } else if (hours > 0) {
            time.textContent = `${hours}h`;
        } else {
            time.textContent = `${minutes}min`;
        }

        const servingsTitle = document.createElement("h3");
        servingsTitle.textContent = "Servings:";

        const servings = document.createElement("p");
        servings.textContent = `${recipe.servingSize || 0}`;

        const ingredientsHeading = document.createElement("h3");
        ingredientsHeading.textContent = "Ingredients:";

        const ingredientsList = document.createElement("ul");

        (recipe.ingredients || []).forEach((ingredient) => {
            const item = document.createElement("li");
            item.textContent = ingredient;
            ingredientsList.appendChild(item);
        });

        const instructionsHeading = document.createElement("h3");
        instructionsHeading.textContent = "Instructions:";

        const instructionsList = document.createElement("ol");

        (recipe.instructions || []).forEach((instruction) => {
            const item = document.createElement("li");
            item.textContent = instruction;
            instructionsList.appendChild(item);
        });

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit Recipe";
        editButton.className = "edit-recipe";

        editButton.addEventListener("click", () => {
            sessionStorage.setItem("editRecipeId", recipe.id);
            window.location.hash = "#create-recipe";
        });

        details.append(
            title,
            descriptionTitle,
            description,
            timeTitle,
            time,
            servingsTitle,
            servings,
            ingredientsHeading,
            ingredientsList,
            instructionsHeading,
            instructionsList,
            editButton
        );

    } catch (error) {
        console.error("Could not display recipe:", error);

        message.textContent =
            error.message || "Could not load this recipe.";
    }
}
