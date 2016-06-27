var app = angular.module('food',['ngAnimate']);

var ingredients = {items: []};

var user = {id: 1,likes: [],blocked:[]};



//before the app start we get the ingredient from the web server
//each item will represent a page of category that will be hidden with the hide directive
app.run(function($http){
    $http.get("https://foodws-yonit.herokuapp.com/ingredients").success(function(data){
        ingredients.items = data;
        angular.forEach(ingredients.items,function(item){
            item.hide = true;
        });
        ingredients.items[0].hide = false;
    });
    $http.get("https://foodws-yonit.herokuapp.com/get-user?user_id=" + user.id).success(function(data){
        user.likes = data.likes;
        user.blocked = data.blocked;
    });
});

//this array will hold the ingredients the user do not want in his food





var ingredientsArray = [];



//main controller of the application
app.controller('controller',function($scope,$http){

    $scope.mealTimeTime = "";

    $scope.darkBG = true;

    //recipe to appear on the block page
    $scope.blockPageRecipe = {};

    //app user
    $scope.user = user;

    //will show/hide good night
    $scope.goodNightHide = true;

    //title of the header
    $scope.headerTitle = "Foodstuffs";

    //will hide/show the categories page.
    $scope.foodstuffsHide = false;

    //will hide/show the block page.
    $scope.blockPageHide = true;

    //will hide/show the main logo.
    $scope.mainLogo = false;

    //will disable/enable drawer
    $scope.drawerFlag = true;

    //will hide/show the timepicker
    $scope.timePicker = true;

    //will hide/show the recipes page.
    $scope.recipesSectionHide = true;

    //the day that is displayed
    $scope.currentDay = 0;

    //hold the data recipes
    $scope.recipes = {days : [
        {name:"Su",meals: [], hide: false},
        {name:"Mo",meals: [], hide: true},
        {name:"Tu",meals: [], hide: true},
        {name:"We",meals: [], hide: true},
        {name:"Th",meals: [], hide: true},
        {name:"Fr",meals: [], hide: true},
        {name:"Sa",meals: [], hide: true}
    ]};

    //index of the current page in the category page
    $scope.currentPage = 0;

    //the ingredients data
    $scope.ingredients = ingredients;

    //when the left button is pressed
    //we hide the current page and show the previous one
    $scope.goLeft = function() {
        $scope.ingredients.items[$scope.currentPage].hide = true;
        $scope.currentPage--;
        if($scope.currentPage < 0){
            $scope.currentPage = $scope.ingredients.items.length - 1 ;
            $scope.ingredients.items[$scope.currentPage].hide = false;
        }
        else{
            $scope.ingredients.items[$scope.currentPage].hide = false;
        }
    };

    //when the right button is pressed
    //we hide the current page and show the next one
    $scope.goRight = function() {
        $scope.ingredients.items[$scope.currentPage].hide = true;
        $scope.currentPage++;
        if ($scope.currentPage >= $scope.ingredients.items.length) {
            $scope.ingredients.items[0].hide = false;
            $scope.currentPage = 0;
        }
        else {
            $scope.ingredients.items[$scope.currentPage].hide = false;
        }
    };

    //if the switched is pressed the item name will be added or removed from the array
    $scope.changeArray = function(name,checked) {
        if (checked) {
            ingredientsArray.push(name);
        }
        if (!checked) {
            ingredientsArray.splice(ingredientsArray.indexOf(name),1);
        }
    };

    //get the index of the day, hide the previous day and display the current day
    $scope.selectDay = function(index) {
        $scope.recipes.days[$scope.currentDay].hide = true;
        $scope.recipes.days[index].hide = false;
        $scope.currentDay = index;
    };

    //when clicking the recipes page
    // the app will get from the WS the recipes that match the ingredients sent
    //than on success the data will be divided to days
    //each day will receive three random recipes to each meal
    //each meal will get directives to hide certain objects
    //the days will be hidden except one
    $scope.recipesClick = function() {
        $http({
            url: "https://foodws-yonit.herokuapp.com/get-recipes",
            method: "GET",
            params: {ingredients : ingredientsArray, blockedRecipes: $scope.user.blocked}
        }).success(function(data) {

            console.log(data);
            $scope.goodNightHide = false;
            var breakfastArray = [];
            var lunchArray = [];
            var dinnerArray = [];
            var dataSize = data.length;
            for(var i = 0 ; i< dataSize; i++){
                if(data[i].meal == "breakfast"){breakfastArray.push(data[i]);}
                if(data[i].meal == "lunch"){lunchArray.push(data[i]);}
                if(data[i].meal == "dinner"){dinnerArray.push(data[i]);}
            }

            for (i = 0 ; i < 7 ; i++){
                $scope.recipes.days[i].meals[0] = breakfastArray[Math.floor(Math.random() * breakfastArray.length)];
                $scope.recipes.days[i].meals[1] = lunchArray[Math.floor(Math.random() * lunchArray.length)];
                $scope.recipes.days[i].meals[2] = dinnerArray[Math.floor(Math.random() * dinnerArray.length)];
                for (var j = 0 ; j < 3 ; j++) {
                    $scope.recipes.days[i].meals[j].pressedDirections = false;
                    $scope.recipes.days[i].meals[j].pressedIngredients = false;
                    $scope.recipes.days[i].meals[j].likedMeal = $scope.user.likes.indexOf($scope.recipes.days[i].meals[j].name) > -1;
                    switch(j){
                        case 0:
                            $scope.recipes.days[i].meals[j].timepickertime = "08:00";
                            break;
                        case 1:
                            $scope.recipes.days[i].meals[j].timepickertime = "13:00";
                            break;
                        case 2:
                            $scope.recipes.days[i].meals[j].timepickertime = "18:00";
                            break;
                    }

                }
            }

            $scope.recipes.days[0].hide = false;
            $scope.selectDay(0);


        });
        $scope.mainLogo = true;
        $scope.darkBG = true;
        $scope.headerTitle = "Recipes";
        $scope.foodstuffsHide = true;
        $scope.recipesSectionHide = false;
        var windowSize = $(window).width();
        if (windowSize > 361) {
            $('nav').show('slide',300);
        }else {
            $('nav').hide('slide', 300);
        }
    };

    //to return to the category menu
    $scope.foodstuffsClick = function() {
        $scope.mainLogo = false;
        $scope.goodNightHide = true;
        $scope.darkBG = true;
        $scope.headerTitle = "FoodStuffs";
        $scope.foodstuffsHide = false;
        $scope.recipesSectionHide = true;
        var windowSize = $(window).width();
        if (windowSize > 361) {
            $('nav').show('slide',300);
        }else {
            $('nav').hide('slide', 300);
        }
    };


    //if the user press ingredients or direction button:
    //the class of the pressed button and the recipe image will be set accordingly
    //the other bottom will be hidden or shown accordingly
    $scope.ingredientsClick = function(meal) {
        meal.pressedIngredients = !meal.pressedIngredients;
        if (meal.pressedDirections) {
            meal.pressedDirections = !meal.pressedDirections;
        }
    };
    $scope.directionsClick = function(meal) {
        meal.pressedDirections = !meal.pressedDirections;
        if (meal.pressedIngredients) {
            meal.pressedIngredients = !meal.pressedIngredients;
        }
    };


    //if the user like a meal
    //the name of the meal will be added to the liked array
    //and the db will be updated
    $scope.likeAMeal = function(meal) {
        var mealNameIndex = $scope.user.likes.indexOf(meal.name);
        if (mealNameIndex > -1 ) {
            meal.likedMeal = false;
            $scope.user.likes.splice(mealNameIndex,1);
        }
        else {
            meal.likedMeal = true;
            $scope.user.likes.push(meal.name);
        }
        console.log($scope.user.likes);
        $http({
            url: "https://foodws-yonit.herokuapp.com/add-likes",
            method: "GET",
            params: {user_id: $scope.user.id, likes: $scope.user.likes}
        }).success(function(data) {});
    };

    //if the user blocks a meal
    //the name of the meal will be added to the blocked array
    //and the db will be updated
    $scope.blockAMeal = function(meal) {
        meal.blockedMeal = true;
        $scope.user.blocked.push(meal.name);

        console.log($scope.user.blocked);
        $http({
            url: "https://foodws-yonit.herokuapp.com/add-blocked",
            method: "GET",
            params: {user_id: $scope.user.id, blocked: $scope.user.blocked}
        }).success(function(data) {});
    };

    //timepicker logic
    $scope.clickArrowUpMin = function(){
        var timeArray = $scope.mealTimeTime.split(":");
        var min = parseInt(timeArray[1]);
        if(min == 59){
            min = 0;
        }else{
            min++;
        }
        if(min>=0 && min <=9){
            $scope.mealTimeTime = timeArray[0] + ":" + "0" + min;
        }else{
            $scope.mealTimeTime = timeArray[0] + ":" + min;
        }


    };
    $scope.clickArrowDownMin = function(){
        var timeArray = $scope.mealTimeTime.split(":");
        var min = parseInt(timeArray[1]);
        if(min == 0){
            min = 59;
        }else{
            min--;
        }
        if(min>=0 && min <=9){
            $scope.mealTimeTime = timeArray[0] + ":" + "0" + min;
        }else{
            $scope.mealTimeTime = timeArray[0] + ":" + min;
        }
    };
    $scope.clickArrowUpHour = function(){
        var timeArray = $scope.mealTimeTime.split(":");
        var hour = parseInt(timeArray[0]);
        if(hour == 23){
            hour = 0;
        }else{
            hour++;
        }
        if(hour>=0 && hour <=9){
            $scope.mealTimeTime = "0" + hour + ":" + timeArray[1];
        }else{
            $scope.mealTimeTime = hour + ":" + timeArray[1];
        }

    };
    $scope.clickArrowDownHour = function(){
        var timeArray = $scope.mealTimeTime.split(":");
        var hour = parseInt(timeArray[0]);
        if(hour == 0){
            hour = 23;
        }else{
            hour--;
        }
        if(hour>=0 && hour <=9){
            $scope.mealTimeTime = "0" + hour + ":" + timeArray[1];
        }else{
            $scope.mealTimeTime = hour + ":" + timeArray[1];
        }
    };

    $scope.setTime = function(i, j){
        $scope.timePicker = false;
        $scope.darkBG = false;
        $scope.mealTimeTime =  $scope.recipes.days[i].meals[j].timepickertime;
        $scope.mealTimeTitle = $scope.recipes.days[i].meals[j].meal.charAt(0).toUpperCase()
            + $scope.recipes.days[i].meals[j].meal.slice(1);
        $scope.clockI = i;
        $scope.clockJ = j;
    };

    $scope.cancelTimepicker = function(){
        $scope.timePicker = true;
        $scope.darkBG = true;
    };

    $scope.doneTimepicker = function(){
        $scope.recipes.days[$scope.clockI].meals[$scope.clockJ].timepickertime = $scope.mealTimeTime;
        $scope.timePicker = true;
        $scope.darkBG = true;

    };

    $scope.openBlockPage = function(i, j){
        $scope.blockPageRecipe = $scope.recipes.days[i].meals[j];
        $scope.blockPageHide = false;
        $scope.drawerFlag = false;
    };

    $scope.blockDone = function(){
        $scope.blockAMeal($scope.blockPageRecipe);
        $scope.blockPageHide = true;
        $scope.drawerFlag = true;
        $scope.recipesClick();
    };

    $scope.blockCancel = function(){
        $scope.blockPageHide = true;
        $scope.drawerFlag = true;
    };

    $(document).ready(function(){
        $('#button').click(function(){
            if($scope.drawerFlag) {
                $('nav').show('slide', 300);
            }
        });
        $('#navLogo').click(function(){
            $('nav').hide('slide',300);
        });
    });

});

// Add this directive where you keep your directives
app.directive('onLongPress', function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $elm, $attrs) {
            $elm.bind('touchstart', function(evt) {
                // Locally scoped variable that will keep track of the long press
                $scope.longPress = true;

                // We'll set a timeout for 600 ms for a long press
                $timeout(function() {
                    if ($scope.longPress) {
                        // If the touchend event hasn't fired,
                        // apply the function given in on the element's on-long-press attribute
                        $scope.$apply(function() {
                            $scope.$eval($attrs.onLongPress)
                        });
                    }
                }, 1200);
            });

            $elm.bind('touchend', function(evt) {
                // Prevent the onLongPress event from firing
                $scope.longPress = false;
                // If there is an on-touch-end function attached to this element, apply it
                if ($attrs.onTouchEnd) {
                    $scope.$apply(function() {
                        $scope.$eval($attrs.onTouchEnd)
                    });
                }
            });
        }
    };
});

app.directive('html', [ function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.html(attrs.html);
        }
    }
}]);

