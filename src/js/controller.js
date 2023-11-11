import * as model from './model';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultView from './views/resultView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import AddRecipeView from './views/addRecipeView';


import 'core-js/stable';
import 'regenerator-runtime/runtime';
import addRecipeView from './views/addRecipeView';

// if(module.hot) {
//  module.hot.accept();
// }


const controlRecipes = async function() {
  try{
    const id = window.location.hash.slice(1);
    
    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultView.update(model.getSearchResultPage());
    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
    
    // 2) Loading recipe
    await model.loadRecipe(id);
    
    // 3) Rendering recipe
    recipeView.render(model.state.recipe);  
    // console.log(model.state.recipe)
  }catch(err) {
    recipeView.renderError();
    console.error(err)
  }
};

const controlSearchResults = async function() {
  try{  

    resultView.renderSpinner();
    console.log(resultView);

    // 1) Get search query

  const query = searchView.getQuery();
  if(!query) return;

  //2)  Load search results
    
   await model.loadSearchResults(query);

   //3) render results
   // console.log(model.state.search.results);
  
   resultView.render(model.getSearchResultPage());
   // 4) renedred Initial pagination button
  paginationView.render(model.state.search);

  } catch(err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
  // 1) render new results
    resultView.render(model.getSearchResultPage(goToPage));
   // 2) renedred new pagination buttons
    paginationView.render(model.state.search);


}


const controlServings = function(newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);
  //Update the recipe View
 // recipeView.render(model.state.recipe)
   recipeView.update(model.state.recipe)

};

const controlAddBookmark = function() {
  // 1) Add/remove bookmark
  if(!model.state.recipe.bookmarked )  model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
 
  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe) {
  try{
      //Show loading spinner
      addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe)

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    //cHANGE ID in URL 
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err){
    console.error('OPS', err);
    addRecipeView.renderError(err.message);
  }
}

const init  = function() {
  bookmarksView.addHanlderRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();