import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';

/******* Global state of the app ********
* - Search object
* - Current recipe object
* - Shopping
* - Liked recipes
*/
const state = {};
window.state = state;

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

        //Highlight selected search items
        if(state.search) searchView.highlightSelected(id);

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
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id));
        } catch (err) {
            alert('Error processing recipe!');
        }
    }
};

['hashchange', 'load'].forEach( event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
*/

const controlList = () => {
    //Create a list if there is none yet
    if(!state.list) state.list = new List();

    //Add each ingr to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle delete 
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);

        //Handle count update
    } else if(e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }   
});

/**
 * LIKES CONTROLLER
*/
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //Toggle like btn
        likesView.toggleLikeBtn(true);

        // Add like to the UI list
        likesView.renderLike(newLike);

    //User has liked current recipe
    } else {
        //remove like to the state
        state.likes.deleteLike(currentID);

        //Toggle like btn
        likesView.toggleLikeBtn(false);

        //remove like to the UI list
        likesView.deleteLike(currentID);
        
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}




// Handling recipe btn clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease  btn is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increasee, .btn-increase *')) {
        //Increase btn clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add inredients to shopping list
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
});

window.l = new List();

