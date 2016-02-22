// get user to select type of cheese
// cheese will be linked to an array of wines
// search for wines with search api = throw product ids into an array
// use geolocation to map out closest lcbos within 5km radius using lat and lon - show distance and time it takes to walk, drive and transit
// search inventory button per store to serach for the wines that were returned (using the array of product ids)
//show results using flickity
//maybe arrange price from lowest to highest using isotop


var app = {};

app.lcboKey = 'MDo4ODhhMzJkOC1kNzdkLTExZTUtYmUwNC04Yjk1NTQ0N2FkMzk6b3NqQWpOTFZjcnVNUXk0cUE3QTJCWXRTTm0xa0lsaTM0WU03';
app.googleKey = 'AIzaSyDjd4loXlmgliI0LzAhFqQyco_7OycUMR8'; //wine app key

//all options for google maps is held in app.mapOptions 
app.cheeseTypes = {
	soft: {
		white: ['Champagne', 'Chardonnay', 'Sparkling Wine', 'Pinot Blanc'],
		red: ['Pinot Noir', 'Gamay', 'Zweigelt']
	},
	semiSoft: {
		white: ['Sauvignon Blanc', 'Gewürztraminer', 'Chardonnay', 'Chenin Blanc'],
		red: ['Cabernet Sauvignon', 'Pinot Noir', 'Merlot']
	},
	firm: {
		white: ['Zinfandel', 'Sauvignon Blanc'],
		red: ['Chianti', 'Merlot', 'Cabernet Sauvignon']
	},
	semiFirm: {
		white: ['Chardonnay', 'Gewürztraminer'],
		red: ['Chianti', 'Merlot', 'Cabernet Sauvignon']
	},
	blue: {
		white: ['Ice Wine', 'Dessert Wine', 'Riesling', 'Zinfandel'],
		red: ['Cabernet Sauvignon', 'Merlot']
	},
	fresh: {
		white: ['Sauvignon Blanc', 'Pinot Grigio', 'Chenin Blanc'],
		red: ['Cabernet Sauvignon']
	}
}



app.displayMatchedWines = function(){
	console.log("entered displayed Matched Wines")
	// console.log(app.cheeseTypes[0])
	//passed in app.cheeseType from app.init();

	for (type in app.cheeseTypes) {
		if (app.cheeseType === type) {
			app.cheeseDataRed = app.cheeseTypes[type].red;
			app.cheeseDataWhite = app.cheeseTypes[type].white;
			console.log(app.cheeseDataRed, app.cheeseDataWhite);
		}
	}
	//appending the wines to the DOM that match the selected cheese types
	
	var appendMatches = function(){
		$(".wineType").empty();
		app.cheeseDataRed.forEach(function(val, i){
			var redWine = $("<p>").text(val);
			$(".redWineTypes").append(redWine);
		})

		app.cheeseDataWhite.forEach(function(val,i){
			var whiteWine = $("<p>").text(val);
			$(".whiteWineTypes").append(whiteWine);
		})

		var findWhiteWines = $("<a>").attr("href", "#location").data("wineType", "white").addClass("findStores").text("Find My Store!");
		var findRedWines = $("<a>").attr("href", "#location").data("wineType", "red").addClass("findStores").text("Find My Store!");
		$(".whiteWineTypes").append(findWhiteWines);
		$(".redWineTypes").append(findRedWines);
	}
	appendMatches();

	// when you click on Find My Store it will take the user to the location section 
	$(".wineType").on("click", ".findStores", function(e){
		e.preventDefault();
		app.findUserLocation();
		app.wineType = $(this).data("wineType")
		console.log(app.wineType);
		$("#location").show();
		$("html, body").animate({
		   scrollTop: $("#location").offset().top + 20
		}, 400);
	})
	//call findWine so when user clicks on their preferred type (red or white) it will figure out what types of wine to send off
	// app.findWine()
} 

app.findWine = function(){
	$(".storeDetailsWrap").on("click", ".checkInventory", function(e){
		e.preventDefault();
		console.log("clicked the find store link");
		//included a data attribute when we appended the check inventory link - tells us the store ID to pass onto the check inventory in this specific store function 
		app.storeID = $(this).data("storeId");
		console.log(app.storeID);

		if (app.wineType === "white") {
			app.wineData = app.cheeseDataWhite;
			//app.cheeseDataWhite is the array of the red wines for the selected cheese
			console.log(app.wineData);
		} else if(app.wineType === "red") {
			app.wineData = app.cheeseDataRed;
			//app.cheeseDataRed is the array of red wines for the selected cheese types
			console.log(app.wineData);
		}

		//looping through app.wineData and making an ajax request for each value
		app.wineData.forEach(function(val, i){
			app.wineType = val;
			console.log(app.wineType);
			app.drinkData();
		})
	})
}


// app.checkInventory = function(){
// 	$(".store-details-wrap").on("click", "a", function(e){
// 		e.preventDefault();
// 		console.log("click");
// 		app.storeID = $(this).data("store-id")
// 		console.log(app.storeID);
// 		app.drinkData();
// 		// app.checkWineInventory(app.storeID)
// 	})
// }


//all wine data is stored here - use this as a reference after you get all the final product no's that are available at the specific store. loop through this array and find product details
app.allProductNos = [];
// app.productNoArray = [];
app.currentPage = 1;
app.allWineData = [];
app.drinkData = function(){
	//grabs all the product numbers for the wines that match the users selection to pass on to the check inventory function will will return only the products that are present at the store the user chooses
	console.log("entered drink data");
	console.log(app.wineType);

	$.ajax({
		url: 'https://lcboapi.com/products?store_id=' + app.storeID,
		datatype: 'json',
		type: 'GET',
		data: {
			access_key: app.lcboKey,
			page: app.currentPage,
			q: app.wineType,
			primary_category: 'Wine',
			per_page: '100',
			where_not: 'is_dead',
			order: 'price_in_cents.asc'
		}
	}).then(function(data) {
		console.log(data);
		for (item in data.result) {
			// console.log(data.result[item].quantity);
			if ((data.result[item].package === "750 mL bottle") 
				&& (data.result[item].quantity > 0) 
				&& (data.result[item].varietal != "Blend") 
				&& (data.result[item].primary_category === "Wine") 
				&& (data.result[item].stock_type != "VINTAGES")
				&& (data.result[item].image_url != null)) {
			app.allWineData.push(data.result[item]);
			app.allProductNos.push(data.result[item].id);
			}
		}
		
		if (!data.pager.is_final_page || app.currentPage <= 3) {
			console.log(app.currentPage);
			app.currentPage++;
			app.drinkData();
		} else {
			console.log(app.currentPage);
			console.log("final page");
			// app.filterList();
			app.appendItems();
		}


	});
};

app.appendItems = function() {
	// $(".wineItems").empty();
	$("#wineResults").show();
	$("html, body").animate({
	   scrollTop: $("#wineResults").offset().top + 20
	}, 400);
	console.log(app.allWineData);
	console.log(app.allProductNos);
	app.allWineData.forEach(function(val, i){
		if (i <= 14) {
			console.log(val,i);
			var name = $("<p>").text(val.name);
			var price = parseInt(val.price_in_cents);
				newPrice = (price/100).toFixed(2);
				price = $("<p>").text("Price: $"+newPrice);
			var image = $("<img>").attr("src", val.image_url)
			var wineDetails = $('<div>').append(name, price);
			// var wineItem = $('<li class="clearfix wineItem">').append(image)
			var wineItem = $('<div class="clearfix wineItem">').append(wineDetails, image);
			$(".wineItems").append(wineItem);
		};
	})
	app.allWineData = [];

}

app.filteredWineList = [];
app.filterList = function(){
	console.log(app.wineData);
	console.log(app.allWineData);
	app.wineData.forEach(function(val, i) {
		app.allWineData.forEach(function(value,index) {
			for (item in value) {
				var wineVarietal = value.varietal;
				var type = val;
				// console.log(wineVarietal, type)
				var n = wineVarietal.search(type)
				if ( n > -1 ) {
					// console.log(n, wineVarietal, type);
					app.filteredWineList.push(value);
				}
			};
		});
	});
	console.log(app.filteredWineList);
};


// app.checkStoreInventoryList = [];

// app.checkStoreInventory = function(){
// 	// console.log("entered check store inventory")
// 	// console.log(app.productId);
// 	$.ajax ({
// 		url: 'https://lcboapi.com/inventories?store_id=' + app.storeId,
// 		dataType: 'json',
// 		type: 'GET',
// 		data: {
// 			access_key: app.lcboKey,
// 			// product_id: app.productId,
// 			// store_id: app.storeId,
// 			per_page: '100',
// 		}
// 	}).then(function(data){
// 		console.log(data);

// 		if (data.result.quantity > 0) {
// 			// app.checkStoreInventoryList.push(data.result.product_id)
			
// 		} else {
// 			// return false
// 		}
// 		// console.log(app.checkStoreInventoryList);

// 		// app.appendFinalWineItems(); //commented this out feb20

// 		// console.log(data);
// 		// console.log(app.storeId);
// 		// console.log(app.productId);
// 	})
// }

app.newNoDuplicateArray = [1234567890];
app.duplicateFlag = 0;
app.appendFinalWineItems = function(){
// app.newNoDuplicateArray = [1234567890];
// app.duplicateFlag = 0;
	//use the product no's in app.checkStoreInventoryList (array)
	//take the product details by looping in the product no inside app.allWineData (array with an array for each wine type search with objects for each item returned)
	app.checkStoreInventoryList.forEach(function(inventoryVal, i){
		app.allWineData.forEach(function(dataVal, i) {
			for (item in dataVal) {	
				if (inventoryVal === dataVal[item].id) {
					app.newNoDuplicateArray.forEach(function(val, i) {
						if (inventoryVal === val) {	
							app.duplicateFlag = 1;
							return;
						} else {
							return;
						} // closes else
					}); // closes checking for duplicates
					app.newNoDuplicateArray.push(dataVal[item].id);
						if(app.duplicateFlag === 0){	
							var title = $("<h2>").text(dataVal[item].name);
							var thing = $("<div>").append(title);
							$(".wine-items").append(thing);
							};
				} else {
				};// closes else
			}; // closes object loop
			return;
		}); //closes allWineData  loop
	}); //closes check store inventory function
} // closes function


app.findUserLocation = function(){
	$("form[name=locationForm]").on("submit", function(e){
		console.log("click");
		e.preventDefault();
		app.cityPostCd = $("input[type=text]").val();
		console.log(app.cityPostCd);
		app.loadMap();
		app.geocodeAddress(app.geocoder, app.map);
		$("#stores").show();
		$("html, body").animate({
		   scrollTop: $("#stores").offset().top + 20
		}, 400);
		// app.findStore()
	})

	$(".userCurrentLocation").on("click", function(e){
		e.preventDefault();
		app.getCurrentPosition(); //app.findStore will be called in this function

		console.log("click");
		$("#stores").show();
		$("html, body").animate({
		   scrollTop: $("#stores").offset().top + 20
		}, 400);
	})
}
	// currently only enabled for get current position;
	//the lat and lng refers to the user's location 
	//get the store ids
	// pass the store ids to check inventory function - pass the product ids into this function

app.findStore = function() {

	console.log("enter find store");
	console.log(app.lat, app.lng);

	$.ajax({
		url: 'https://lcboapi.com/stores/',
		datatype: 'json',
		type: 'GET',
		data: {
			per_page: 5,
			access_key: app.lcboKey,
			order: 'distance_in_meters',
			lat: app.lat,
			lon: app.lng
		}
	}).then(function(results){
		console.log(results);
		app.storeInfo = results.result;

		app.loadMap();

		function createMarkers(markers) {
			app.markerArray = [];
			for (var i = 0; i < markers.length; i++) {
		        app.addMarker({
		            lat: markers[i].latitude,
		            lng: markers[i].longitude,
		            title: i,
			        });
		        app.marker.setTitle("marker" + i);
		        app.marker.setLabel((i+1).toString());
		        app.markerArray.push(app.marker);
		        //Function to create sidbar
		        // use .data('markerId',i) when creating elements
		    }
		    console.log(app.markerArray);
		}
		createMarkers(results.result);
		// app.findHours(results.result);
		app.displayStores(results.result);
     });
}

app.infoHover = function(){

 	$(".storeDetailsWrap").on("mouseenter", ".storeDetails", function(){
 		var index = $(this).data("markerId");
 		app.markerArray.forEach(function(val, i){
 			if (index === val.title) {
 				app.markerArray[i].setAnimation(google.maps.Animation.BOUNCE);
 				setTimeout(function () {
 				    app.markerArray[i].setAnimation(null);
 				}, 600); // current maps duration of one bounce = 700(v3.13)
 				//look for the marker on the map and make it bounce
 			}
 			
 		});
 	});
}


app.displayStores = function(stores){
	console.log("enter display stores");
	// console.log(stores);
	// app.findHours(stores);
	$(".storeDetailsWrap").empty();
	console.log(app.storeInfo);
	
	var findHours = function(){
		console.log(app.storeInfo);
		var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		var d = new Date();
		var index = d.getDay();
		app.today = days[index];
		console.log(app.today);
		// app.openTime = app.storeInfo[today + "_open"];

		// console.log(app.openTime);
	}
	findHours();

	$.each(stores, function(i, store){

		//storing 
		var storeRank = $('<span class="rank">').text(i+1+'.  '); //can also use the value of [i] here
		var address = $("<p>").text(store.address_line_1).prepend(storeRank);
		// var phone = $("<p>").text(store.telephone);
		// var distance = $("<p>").text(store.distance_in_meters + " m");

		var openTime = store[app.today+"_open"];
		var closeTime = store[app.today+"_close"];

		var convertOpenTime = function(){
			var tick = openTime;
			var mins = Math.floor(tick/60);
			var secs = tick % 60;
			app.open = (mins < 10 ? "0" : "" ) + mins + ":" + (secs < 10 ? "0" : "" ) + secs;
			console.log(app.open);
		}

		var convertCloseTime = function(){
			var tick = closeTime - 720;
			var mins = Math.floor(tick/60);
			var secs = tick % 60;
			app.close = (mins < 10 ? "0" : "" ) + mins + ":" + (secs < 10 ? "0" : "" ) + secs;
		}
		convertOpenTime(openTime);
		convertCloseTime(closeTime);
		if (app.open == "12:00") {
			var hours = $("<p>").text("Open today from " + app.open + " pm to " + app.close + " pm");
		} else {
			var hours = $("<p>").text("Open today from " + app.open + " am to " + app.close + " pm");
		}

		// var hours = $("<p>").text("Open today from " + app.open + " am to " + app.close + " pm");
		//adding data attribute so we can grab it when we check inventory
		var checkInventory = $("<a>").attr("href", "#").text("Find My Wine!").data("storeId", store.store_no).addClass("checkInventory");
		//store details has a class of store-details and data-markerId attribute of marker[i] which matches the markerId in each marker object
		var storeDetails = $("<div>").append(address, hours, checkInventory).addClass("storeDetails").data("markerId", "marker"+i);
		$(".storeDetailsWrap").append(storeDetails);
	})
}



app.addMarker = function(lat, lng){
	app.marker = new google.maps.Marker({ 
		position: new google.maps.LatLng(lat, lng),
		map: app.map,
		draggable: false,
		animation: google.maps.Animation.DROP,
	})
}
// GEOLOCATION

app.loadMap = function(){
	app.mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"},{"color":"#052366"},{"saturation":"-70"},{"lightness":"85"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":"-53"},{"weight":"1.00"},{"gamma":"0.98"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45},{"visibility":"on"}]},{"featureType":"road","elementType":"geometry","stylers":[{"saturation":"-18"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#57677a"},{"visibility":"on"}]}]
	// app.mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#ff6a6a"},{"lightness":"0"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ee3123"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ee3123"}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ee3123"},{"lightness":"62"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"lightness":"75"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.bus","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"labels.icon","stylers":[{"weight":"0.01"},{"hue":"#ff0028"},{"lightness":"0"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#80e4d8"},{"lightness":"25"},{"saturation":"-23"}]}]
	console.log("entered load map")
	
	app.mapOptions = {
		center: app.position,
		zoom: 12,
		scaleControl: false,
		scrollwheel: false,
		styles: app.mapStyle
	};
 // Select the map div with jquery, but only the first item in the array. google is expecting a DOM element/div
	app.mapDiv = $(".map")[0];
//pass mapDiv to the map method and store. you need some options and somewhere for it to go in the HTML
	app.map = new google.maps.Map(app.mapDiv, app.mapOptions);

	var marker = new google.maps.Marker({
	  	map: app.map,
	  	position: app.position,
	  	icon: "home.png"
	});
}


//get user location based on their current location
app.getCurrentPosition = function(){
	console.log("entered get current pos")
	navigator.geolocation.getCurrentPosition(function(position){
		app.lat = position.coords.latitude;
		app.lng = position.coords.longitude;
		app.position = {lat : app.lat, lng : app.lng};
		// console.log(app.position);
		app.findStore();
		// app.loadMap();
	})
}

//get user location based on city or postal code input
app.geocodeAddress = function(geocoder, resultsMap) {

	// need to check for an empty object - invalid entry 
	app.map = new google.maps.Geocoder();
  	app.map.geocode({"address": app.cityPostCd}, function(results, status) {
  		// console.log(results);
  		app.lat = results[0].geometry.location.lat();
  		app.lng = results[0].geometry.location.lng();
  		app.position = {lat : app.lat, lng : app.lng};

		if (status === google.maps.GeocoderStatus.OK) {
  			resultsMap.setCenter(results[0].geometry.location);
  			var marker = new google.maps.Marker({
    			map: resultsMap,
    			position: app.position
  			});

  		// console.log(app.lat, app.lng);
  		app.findStore(app.lat, app.lng);
  			
		} else {
  			alert("Please try your search again");
    	}
  	});
}

app.init = function(){


	$("form[name=selectCheese]").on("submit", function(e){
		e.preventDefault();
		app.cheeseType = $("input[name=category]:checked").data("cat");
		console.log(app.cheeseType);
		app.displayMatchedWines(app.cheeseType);
		$("#wineCategories").show();
		$("html, body").animate({
		   scrollTop: $("#wineCategories").offset().top + 20
		}, 400);

	})


	app.findWine();

	// app.loadMap();
	// app.findStore();
	// app.checkInventory();
	// app.getCurrentPosition();
	// app.findUserLocation();
	app.infoHover();


}

$(function() { // begin document ready
	app.init();
  

  	var $window = $(window),
  	    flexslider;
  	
  	// tiny helper function to add breakpoints
  	function getGridSize() {
  	  return (window.innerWidth < 600) ? 2 :
  	         (window.innerWidth < 900) ? 3 : 4;
  	}
  	
  	// $(function() {
  	//   SyntaxHighlighter.all();
  	// });
  	
  	$window.load(function() {
  	  $('.flexslider').flexslider({
  	    animation: "slide",
  	    animationLoop: false,
  	    itemWidth: 210,
  	    itemMargin: 5,
  	    minItems: getGridSize(), // use function to pull in initial value
  	    maxItems: getGridSize() // use function to pull in initial value
  	  });
  	});
  	
  	// check grid size on resize event
  	$window.resize(function() {
  	  var gridSize = getGridSize();
  	
  	  flexslider.vars.minItems = gridSize;
  	  flexslider.vars.maxItems = gridSize;
  	});
}); // end document ready



