var radio = (function() {

	$(document).on("radio", function(event, data) {
		switch (data.header) {
			case "searchResults":
				if (data.content.found_stations) {
					SearchResults(data.content.found_stations);
				}
				break;
			case "homeContent":
				if (data.content.favourites) {
					Favourites(data.content.favourites);
				}
				break;
			case "stationFavourited": 
				if (data.content.guide_id) {
					if (data.content.isFavourite == true) {
						beo.setSymbol('.collection-item[data-guide-id="'+data.content.guide_id+'"] .collection-item-secondary-symbol', './common/symbols-black/star-filled.svg');
					} else {
						beo.setSymbol('.collection-item[data-guide-id="'+data.content.guide_id+'"] .collection-item-secondary-symbol', './common/symbols-black/star.svg');
					}
				}
				break;
		}
	});

	$("#queryString").keypress(function(key) {
	    if (key.which == 13 && $(this).val()) {
	        var query = $(this).val();

	        beo.sendToProduct("radio", {
	        	header: "search", 
	        	content: query
	        });
	        
	        goTo(2)
	        $("#radio-l2 h1").html("Search Results")
	        $("#search-results").removeClass("hidden")
	    }
	}).keyup(function() {
		if ($(this).val().length < 1) {
	        $(".no-results").css("display", "none")
	    }
	})

	$("#return-l2").click(function() {
		$("#search-results").empty()
		$(".radio-group-l2").empty()
	})

	function SearchResults(radios) {
		if (Object.keys(radios).length > 0) {
			$("#search-results").empty()
			for (item in radios) {
				radio.createCollectionWithImg(radios[item]);
			}
			$(".no-results").css("display", "none")
		} else {
			$(".no-results").css("display", "block")
		}
	}

	function Favourites(radios) {
		if (Object.keys(radios).length > 0) {
			$("#radio-favourites").removeClass("hidden")
			$("#radio-favourite-items").empty()
			for (item in radios) {
				itemOptions = {
					label: radios[item].title,
					icon: radios[item].img,
					iconSize: "small",
					onclick: "radio.playRadio('"+radios[item].url+"', '"+radios[item].title+"');",
					onclickSecondary: "radio.addToFavorite('"+item+"')",
					secondarySymbol: "./common/symbols-black/star-filled.svg",
					data: { "data-guide-id": item }
				}
				$("#radio-favourite-items").append(beo.createCollectionItem(itemOptions));
			}
		} else {
			$("#radio-favourites").addClass("hidden")
		}
	}

	function playRadio(link, title) {
		beo.sendToProduct("radio", { 
			header: "play",
			content: {
				URL: link,
				stationName: title	
			}
		});
	}

	function createCollectionWithImg(item) { 
		if (item.isFavourite) {
			secondarySymbol = "./common/symbols-black/star-filled.svg";
		} else {
			secondarySymbol = "./common/symbols-black/star.svg";
		}
		itemOptions = {
			label: item.name,
			icon: item.favicon,
			iconSize: "small",
			onclick: "radio.playRadio('"+item.url+"', '"+item.name+"');",
			onclickSecondary: "radio.addToFavorite('"+item.stationuuid+"')",
			secondarySymbol: secondarySymbol,
			data: { "data-guide-id": item.stationuuid }
		}
		$("#search-results").append(beo.createCollectionItem(itemOptions));
	}

	function addToFavorite(stationId) {
		beo.sendToProduct("radio", { 
			header: "add-to-favourite",
			content: { stationId: stationId }
		});
	}

	function goTo(level) {
		beo.showDeepMenu("radio-l"+level);
	}

	return {
		goTo: goTo,
		playRadio: playRadio,
		createCollectionWithImg: createCollectionWithImg,
		addToFavorite: addToFavorite
	};

}) ();

