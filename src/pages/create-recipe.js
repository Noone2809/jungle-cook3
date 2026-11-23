
import {
    initializeRecipes,
    getRecipeById,
    saveRecipe
} from "../data/recipeStore.js";

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "firebase/auth";

export default function createRecipePage() {
    return `
        <div class="create-recipe" id="createRecipePage">
            <h2 id="recipeGreeting">Create your recipe!</h2>

            <form id="recipeForm">
                <div class="recipe-information">

                    <div class="recipe-field-image">
                        <label for="recipeImage">Add Recipe Image</label>

                        <input type="file" id="recipeImage" accept="image/*">

                        <label for="recipeImage" class="upload-button">
                            Attach file
                        </label>
                    </div>

                    <img id="imagePreview" alt="Recipe preview" style="display:none;">

                    <div class="recipe-field">
                        <label for="recipeName">Recipe Name</label>
                        <input type="text" id="recipeName" required>
                    </div>

                    <div class="recipe-field">
                        <label for="recipeDescription">Recipe Description</label>
                        <textarea id="recipeDescription" required></textarea>
                    </div>

                    <div class="recipe-field-time">
                        <label>Recipe Total Time</label>

                        <div class="time-input">
                            <input type="number" id="recipeHours" min="0" placeholder="Hours">
                            <input type="number" id="recipeMinutes" min="0" max="59" placeholder="Minutes">
                        </div>
                    </div>

                    <div class="recipe-field-serving">
                        <label for="recipeServing">Recipe Serving Size</label>
                        <input type="number" id="recipeServing" min="1" placeholder="Servings" required>
                    </div>

                </div>

                <div class="ingredient-section">
                    <h3>Enter Ingredients:</h3>
                    <div id="ingredientList"></div>
                    <button type="button" id="addIngredient">+</button>
                </div>

                <div class="instruction-section">
                    <h3>Enter Instructions:</h3>
                    <div id="instructionList"></div>
                    <button type="button" id="addInstruction">+</button>
                </div>

                <p id="recipeMessage" role="status" aria-live="polite"></p>

                <button type="submit" id="createRecipeButton">
                    Create Recipe
                </button>
            </form>
        </div>
    `;
}

export async function init() {
    const page = document.querySelector("#createRecipePage");
    if (!page) return;

    const message = page.querySelector("#recipeMessage");

    //log in chack
    const user = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            unsubscribe();
            resolve(currentUser);
        });
    });

    if (!user) {
        page.innerHTML = `
            <div class="login-required">
                <h2>Oops!</h2>
                <p>You need to log in before accessing this page.</p>
                <button type="button" id="loginButton">Log In</button>
            </div>
        `;

        page.querySelector("#loginButton").addEventListener("click", () => {
            window.location.hash = "#login";
        });

        return;
    }

    try {
        await initializeRecipes(user.uid);
    } catch (error) {
        console.error(error);
        message.textContent = "Could not load your recipes.";
        return;
    }

    const form = page.querySelector("#recipeForm");
    const greeting = page.querySelector("#recipeGreeting");

    const ingredientList = page.querySelector("#ingredientList");
    const instructionList = page.querySelector("#instructionList");

    const imageInput = page.querySelector("#recipeImage");
    const imagePreview = page.querySelector("#imagePreview");

    const hoursInput = page.querySelector("#recipeHours");
    const minutesInput = page.querySelector("#recipeMinutes");

    const submitButton = page.querySelector("#createRecipeButton");

    const editRecipeId = sessionStorage.getItem("editRecipeId");

    let recipeImageData = "";

    greeting.textContent = `Hey ${user.displayName?.split(" ")[0] || "there"}, create your recipe!`;

    //Add ingredient
    function addInput(list, label, value = "") {
        const row = document.createElement("div");
        row.classList.add("recipe-input-row");

        const input = document.createElement("input");
        input.type = "text";
        input.required = true;
        input.value = value;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.classList.add("remove-input");

        removeButton.addEventListener("click", () => {
            row.remove();
            updateNumbers(list, label);
        });

        row.append(input, removeButton);
        list.appendChild(row);

        updateNumbers(list, label);
    }

    //Update ingredient
    function updateNumbers(list, label) {
        list.querySelectorAll(".recipe-input-row input").forEach((input, index) => {
            input.placeholder = `${label} #${index + 1}`;
        });
    }

    //image
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            message.textContent = "Please choose an image file.";
            imageInput.value = "";
            return;
        }

        const reader = new FileReader();

        message.textContent = "Loading image...";

        reader.onload = (event) => {
            recipeImageData = event.target.result;

            imagePreview.src = recipeImageData;
            imagePreview.style.display = "block";

            message.textContent = "";
        };

        reader.onerror = () => {
            message.textContent = "Could not read the image.";
        };

        reader.readAsDataURL(file);
    });

    //ingredient button
    page.querySelector("#addIngredient").addEventListener("click", () => {
        addInput(ingredientList, "Ingredient");
    });

    //instruction button
    page.querySelector("#addInstruction").addEventListener("click", () => {
        addInput(instructionList, "Instruction");
    });

    //editing
    if (editRecipeId) {
        greeting.textContent = `Hey ${user.displayName?.split(" ")[0] || "there"}, edit your recipe!`;

        submitButton.textContent = "Save Changes";
        message.textContent = "Loading recipe...";

        try {
            const recipe = getRecipeById(user.uid, editRecipeId);

            if (!recipe) {
                throw new Error("This recipe could not be found.");
            }

            page.querySelector("#recipeName").value = recipe.name || "";
            page.querySelector("#recipeDescription").value = recipe.description || "";
            page.querySelector("#recipeServing").value = recipe.servingSize || "";

            const totalTime = Number(recipe.totalTime) || 0;

            hoursInput.value = Math.floor(totalTime / 60);
            minutesInput.value = totalTime % 60;

            recipeImageData = recipe.image || "";

            if (recipeImageData) {
                imagePreview.src = recipeImageData;
                imagePreview.style.display = "block";
            }

            (recipe.ingredients || []).forEach(item => {
                addInput(ingredientList, "Ingredient", item);
            });

            (recipe.instructions || []).forEach(item => {
                addInput(instructionList, "Instruction", item);
            });

            message.textContent = "";

        } catch (error) {
            message.textContent = error.message;
            sessionStorage.removeItem("editRecipeId");
            return;
        }

    } else {
        for (let index = 0; index < 3; index++) {
            addInput(ingredientList, "Ingredient");
            addInput(instructionList, "Instruction");
        }
    }

    //Save
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const ingredients = [...ingredientList.querySelectorAll("input")]
            .map(input => input.value.trim());

        const instructions = [...instructionList.querySelectorAll("input")]
            .map(input => input.value.trim());

        if (!ingredients.length || ingredients.some(item => !item) ||
            !instructions.length || instructions.some(item => !item)) {
            message.textContent = "Please complete every ingredient and instruction.";
            return;
        }

        const hours = Number(hoursInput.value) || 0;
        const minutes = Number(minutesInput.value) || 0;

        if (!hoursInput.value && !minutesInput.value) {
            message.textContent = "Please enter the total recipe time.";
            return;
        }

        if (hours < 0 || minutes < 0 || minutes > 59) {
            message.textContent = "Please enter a valid recipe time.";
            return;
        }

        const totalTime = (hours * 60) + minutes;

        const recipeData = {
            name: page.querySelector("#recipeName").value.trim(),
            description: page.querySelector("#recipeDescription").value.trim(),
            image: recipeImageData,
            totalTime: totalTime,
            servingSize: Number(page.querySelector("#recipeServing").value),
            ingredients,
            instructions,
            userId: user.uid
        };

        submitButton.disabled = true;
        submitButton.textContent = editRecipeId
            ? "Saving Changes..."
            : "Creating Recipe...";

        message.textContent = "Saving your recipe...";

        try {
            saveRecipe(user.uid, recipeData, editRecipeId || null);

            if (editRecipeId) {
                sessionStorage.removeItem("editRecipeId");
                alert("Recipe updated successfully!");
            } else {
                alert("Recipe created successfully!");
            }

            window.location.hash = "#your-recipes";

        } catch (error) {
            console.error("Could not save recipe:", error);

            message.textContent =
                error.name === "QuotaExceededError"
                    ? "Your browser storage is full. Try using a smaller image."
                    : error.message || "Could not save your recipe.";

            submitButton.disabled = false;
            submitButton.textContent = editRecipeId
                ? "Save Changes"
                : "Create Recipe";
        }
    });
}
