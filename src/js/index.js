import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';


/******* Global state of the app ********
* - Search object
* - Current recipe object
* - Shopping
* - Liked recipes
*/
const state = {};

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1 Get query from view
    const query = searchView.getInput();

    if(query) {
        // 2 New search object and add to state
        state.search = new Search(query);

        // 3 Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            // 4 Search for recipe
            await state.search.getResults();

            // 5 Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something went wrong with the search... index.js');
            clearLoader();
        }
    }

}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        
    }
})

//search.getResults();

/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
    //Get id from url
    const id = window.location.hash.replace('#', '');    
    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Create new recipe object
        state.recipe = new Recipe(id);

        try {
            //Get recipe data and parse ingrs
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calc servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            alert('Error processing recipe!');
        }
    }
};

['hashchange', 'load'].forEach( event => window.addEventListener(event, controlRecipe));

