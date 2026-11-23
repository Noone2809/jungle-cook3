
const STORAGE_KEY = "jungleCookRecipes";
const FIRST_RECIPE_ID = "recipe-001";

function sortRecipes(recipes) {
    return [...recipes].sort((a, b) => {
        if (a.id === FIRST_RECIPE_ID) return -1;
        if (b.id === FIRST_RECIPE_ID) return 1;
        return 0;
    });
}

export async function initializeRecipes(userId) {
    if (!userId) {
        throw new Error("User is not logged in.");
    }

    const userStorageKey = `${STORAGE_KEY}_${userId}`;

    const response = await fetch(
        `${import.meta.env.BASE_URL}data/recipes.json`
    );

    if (!response.ok) {
        throw new Error(
            `Unable to load recipe data. Server returned ${response.status}.`
        );
    }

    const hardCodedRecipes = await response.json();

    const storedRecipes = localStorage.getItem(userStorageKey);
    const userRecipes = storedRecipes
        ? JSON.parse(storedRecipes)
        : [];

    const mergedRecipes = [...userRecipes];

    hardCodedRecipes.forEach((hardCodedRecipe) => {
        const recipeWithCorrectImage = {
            ...hardCodedRecipe,
            image: hardCodedRecipe.image?.startsWith("/")
                ? `${import.meta.env.BASE_URL}${hardCodedRecipe.image.slice(1)}`
                : hardCodedRecipe.image
        };

        const existingIndex = mergedRecipes.findIndex(
            recipe => recipe.id === hardCodedRecipe.id
        );

        if (existingIndex === -1) {
            mergedRecipes.push(recipeWithCorrectImage);
        } else {
            mergedRecipes[existingIndex] = {
                ...mergedRecipes[existingIndex],
                image: recipeWithCorrectImage.image
            };
        }
    });

    const sortedRecipes = sortRecipes(mergedRecipes);

    localStorage.setItem(
        userStorageKey,
        JSON.stringify(sortedRecipes)
    );

    return sortedRecipes;
}

export function getRecipes(userId) {
    if (!userId) return [];

    const userStorageKey = `${STORAGE_KEY}_${userId}`;
    const storedRecipes = localStorage.getItem(userStorageKey);

    if (!storedRecipes) return [];

    const recipes = sortRecipes(JSON.parse(storedRecipes));

    localStorage.setItem(
        userStorageKey,
        JSON.stringify(recipes)
    );

    return recipes;
}

export function getRecipeById(userId, recipeId) {
    const recipes = getRecipes(userId);
    return recipes.find(recipe => recipe.id === recipeId);
}

export function saveRecipe(userId, recipe, recipeId = null) {
    if (!userId) {
        throw new Error("User is not logged in.");
    }

    const recipes = getRecipes(userId);

    if (recipeId) {
        const index = recipes.findIndex(
            item => item.id === recipeId
        );

        if (index === -1) {
            throw new Error("Recipe could not be found.");
        }

        recipes[index] = {
            ...recipes[index],
            ...recipe,
            id: recipeId
        };
    } else {
        recipes.push({
            ...recipe,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        });
    }

    const sortedRecipes = sortRecipes(recipes);

    localStorage.setItem(
        `${STORAGE_KEY}_${userId}`,
        JSON.stringify(sortedRecipes)
    );

    return sortedRecipes;
}

export function deleteRecipe(userId, recipeId) {
    if (!userId) {
        throw new Error("User is not logged in.");
    }

    const recipes = getRecipes(userId);

    const updatedRecipes = recipes.filter(
        recipe => recipe.id !== recipeId
    );

    const sortedRecipes = sortRecipes(updatedRecipes);

    localStorage.setItem(
        `${STORAGE_KEY}_${userId}`,
        JSON.stringify(sortedRecipes)
    );

    return sortedRecipes;
}
