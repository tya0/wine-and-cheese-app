var app = {};

app.lcboKey = 'MDo4ODhhMzJkOC1kNzdkLTExZTUtYmUwNC04Yjk1NTQ0N2FkMzk6b3NqQWpOTFZjcnVNUXk0cUE3QTJCWXRTTm0xa0lsaTM0WU03';
app.googleKey = 'AIzaSyDjd4loXlmgliI0LzAhFqQyco_7OycUMR8'; 

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
	//passed in app.cheeseType from app.init();

	for (type in app.cheeseTypes) {
		if (app.cheeseType === type) {
			app.cheeseDataRed = app.cheeseTypes[type].red;
			app.cheeseDataWhite = app.cheeseTypes[type].white;
			// console.log(app.cheeseDataRed, app.cheeseDataWhite);
		}
	}
	//appending the wines that pair with the selected cheese types
	
	var appendMatches = function(){
		$(".redWineTypes, .whiteWineTypes").empty();
		app.cheeseDataRed.forEach(function(val, i){
			var redWine = $("<p>").text(val);
			$(".redWineTypes").append(redWine);
		})

		app.cheeseDataWhite.forEach(function(val,i){
			var whiteWine = $("<p>").text(val);
			$(".whiteWineTypes").append(whiteWine);
		})

		// var findWhiteWines = $("<a>").attr("href", "#location").data("wineType", "white").addClass("findStores").text("SEARCH");
		// var findRedWines = $("<a>").attr("href", "#location").data("wineType", "red").addClass("findStores").text("SEARCH");
		// $(".whiteWineTypes").append(findWhiteWines);
		// $(".redWineTypes").append(findRedWines);
	};
	appendMatches();

	// when you click on Go it will take the user to the location section to find out user's location
	
	// $(".wineType").on("click", function(e){
	// 	e.preventDefault();
	// 	app.findUserLocation();
	// 	app.wineType = $(this).data("winetype")
	// 	$("#location").show();
	// 	$("html, body").animate({
	// 	   scrollTop: $("#location").offset().top + 10
	// 	}, 500);
	// })


	$("form[name=selectWine]").on("submit", function(e){
		e.preventDefault();
		app.findUserLocation();
		app.wineType = $("input[name=wine]:checked").data("winetype")
		$("#location").show();
		$("html, body").animate({
		   scrollTop: $("#location").offset().top + 10
		}, 500);
	})
};

app.findWine = function(){
	$(".storeDetailsWrap").on("click", ".checkInventory", 
		function(e){
			// console.log(app.wineType);
		e.preventDefault();
		$(this).parent().css("border", "3px solid #F38D65");
		//included a data attribute when we appended the check inventory link - tells us the store ID to pass onto the check inventory in this specific store function 
		app.storeID = $(this).data("storeId");
		// console.log(app.storeID);

		if (app.wineType === "white") {
			app.wineData = app.cheeseDataWhite;
			//app.cheeseDataWhite is the array of the red wines for the selected cheese
			// console.log(app.wineData);
		} else if(app.wineType === "red") {
			app.wineData = app.cheeseDataRed;
			//app.cheeseDataRed is the array of red wines for the selected cheese types
			// console.log(app.wineData);
		}

		//looping through app.wineData and making an ajax request for each value
		app.wineData.forEach(function(val, i){
			app.wineType = val;
			// console.log(val)
			app.drinkData();
		})
	});
};



//all wine data is stored here - use this as a reference after you get all the final products that are available at the specific store. loop through this array and find product details
// app.allProductNos = []; //used this for testing
app.page = 1;
app.allWineData = [];
app.drinkData = function(){
	//grabs all the product numbers for the wines that match the users selection to pass on to the check inventory function will will return only the products that are present at the store the user chooses
	// console.log("entered drink data");
	// console.log(app.wineType);

	$.ajax({
		url: 'https://lcboapi.com/products?store_id=' + app.storeID,
		datatype: 'json',
		type: 'GET',
		data: {
			access_key: app.lcboKey,
			page: app.page,
			q: app.wineType,
			primary_category: 'Wine',
			per_page: '100',
			where_not: 'is_dead',
			order: 'price_in_cents.asc'
		}
	}).then(function(data) {
		// console.log(data);
		for (item in data.result) {
			// console.log(data.result[item].quantity);
			if ((data.result[item].package === "750 mL bottle") 
				&& (data.result[item].quantity > 0) 
				&& (data.result[item].varietal != "Blend") 
				&& (data.result[item].primary_category === "Wine") 
				&& (data.result[item].stock_type != "VINTAGES")
				&& (data.result[item].image_url != null)) {
			app.allWineData.push(data.result[item]);
			}
		};
		
		if (!data.pager.is_final_page || app.page <= 3) {
			app.page++;
			app.drinkData();
		} else {
			app.appendItems();
		}
	});
};

app.appendItems = function() {
	// $(".wineItems").empty();
	$("#wineResults").show();
	$("html, body").animate({
	   scrollTop: $("#wineResults").offset().top + 10
	}, 500);

	 // console.log(app.wineData);
	 // console.log(app.wineType);
	 // console.log(app.allWineData);

	app.allWineData.forEach(function(val, i){
		// if (i <= 14) {
			// console.log(val,i);
			var name = $("<p>").text(val.name);
			var price = parseInt(val.price_in_cents);
				newPrice = (price/100).toFixed(2);
				price = $("<p>").text("Price: $"+newPrice);
			var image = $("<img>").attr("src", val.image_url)
			var wineDetails = $('<div>').append(name, price);
			var wineItem = $('<li class="clearfix wineItem">').append(image, wineDetails)
			$(".wineItems").append(wineItem);
			// setTimeout(function () { app.flexslider; }, 500)

		// };
	});
	app.flexslider();
	app.allWineData = [];
};

app.flexslider = function(){

	$('.flexslider').flexslider({
	    animation: "slide",
	    animationLoop: false,
	    slideShow: false,
	    controlNav: false,
	    itemWidth: 180,
	    itemMargin: 8
	    //minItems: 4
	    //maxItems: 4,
	  });
};

app.filteredWineList = [];
app.filterList = function(){
	// console.log(app.wineData);
	// console.log(app.allWineData);
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
	// console.log(app.filteredWineList);
};

app.findUserLocation = function(){
	$("form[name=locationForm]").on("submit", function(e){
		// console.log("click");
		e.preventDefault();
		app.cityPostCd = $("input[type=text]").val();
		// console.log(app.cityPostCd);
		app.loadMap();
		app.geocodeAddress(app.geocoder, app.map);
		$("#stores").show();
		$("html, body").animate({
		   scrollTop: $("#stores").offset().top + 10
		}, 500);
		$(".spinner").show();
		// app.findStore()
	})

	$(".userCurrentLocation").on("click", function(e){
		e.preventDefault();
		app.getCurrentPosition(); //app.findStore will be called in this function
		// console.log("click");
		$("#stores").show();
		$("html, body").animate({
		   scrollTop: $("#stores").offset().top + 10
		}, 500);
		$(".spinner").show();
	})
};


app.findStore = function() {

	// console.log("enter find store");
	// console.log(app.lat, app.lng);

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
		$(".spinner").hide();
		// console.log(results);
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
		    }
		    // console.log(app.markerArray);
		};
		createMarkers(results.result);
		// app.findHours(results.result);
		app.displayStores(results.result);
     })
};

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
};


app.displayStores = function(stores){
	// console.log("enter display stores");
	$(".storeDetailsWrap").empty();
	// console.log(app.storeInfo);
	
	var findHours = function(){
		// console.log(app.storeInfo);
		var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		var d = new Date();
		var index = d.getDay();
		app.today = days[index];
		// console.log(app.today);
	}
	findHours();

	$.each(stores, function(i, store){

		var storeRank = $('<span class="rank">').text(i+1+'.  '); 
		var address = $("<p>").text(store.address_line_1).prepend(storeRank);
		var openTime = store[app.today+"_open"];
		var closeTime = store[app.today+"_close"];

		var convertOpenTime = function(){
			var tick = openTime;
			var mins = Math.floor(tick/60);
			var secs = tick % 60;
			app.open = (mins < 10 ? "0" : "" ) + mins + ":" + (secs < 10 ? "0" : "" ) + secs;
			// console.log(app.open);
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

		//adding data attribute so we can grab it when we check inventory
		var checkInventory = $("<a>").attr("href", "#").text("Check Inventory").data("storeId", store.store_no).addClass("checkInventory");
		//store details has a class of store-details and data-markerId attribute of marker[i] which matches the markerId in each marker object
		var storeDetails = $("<div>").append(address, hours, checkInventory).addClass("storeDetails").data("markerId", "marker"+i);
		$(".storeDetailsWrap").append(storeDetails);
	})
};

app.addMarker = function(lat, lng){
	app.marker = new google.maps.Marker({ 
		position: new google.maps.LatLng(lat, lng),
		map: app.map,
		draggable: false,
		animation: google.maps.Animation.DROP,
	})
};

// GEOLOCATION

app.loadMap = function(){
	app.mapStyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"},{"color":"#052366"},{"saturation":"-70"},{"lightness":"85"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":"-53"},{"weight":"1.00"},{"gamma":"0.98"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45},{"visibility":"on"}]},{"featureType":"road","elementType":"geometry","stylers":[{"saturation":"-18"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#57677a"},{"visibility":"on"}]}]
	
	app.mapOptions = {
		center: app.position,
		zoom: 13,
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
	  	icon: "./assets/home.png",
	  	optimized: false,
	  	zIndex: 999 
	});
};


//get user location based on their current location
app.getCurrentPosition = function(){
	// console.log("entered get current pos")
	navigator.geolocation.getCurrentPosition(function(position){
		app.lat = position.coords.latitude;
		app.lng = position.coords.longitude;
		app.position = {lat : app.lat, lng : app.lng};
		// console.log(app.position);
		app.findStore();
		// app.loadMap();
	})
};

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
};

app.reset = function() {
	$('#reset').click(function() {
	    location.reload();
	});
}

app.init = function(){


	$("form[name=selectCheese]").on("submit", function(e){
		e.preventDefault();
		app.cheeseType = $("input[name=category]:checked").data("cat");
		// console.log(app.cheeseType);
		app.displayMatchedWines(app.cheeseType);
		$("#wineCategories").show();
		$("html, body").animate({
		   scrollTop: $("#wineCategories").offset().top + 10
		}, 500);

	})

	app.findWine();
	app.infoHover();
	app.reset();
};

$(function() { // begin document ready
	app.init();
 
}); // end document ready



