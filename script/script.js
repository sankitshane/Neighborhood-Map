//Initial Variables
var map;
var count = 0;

//Init MAP function for Google API
function initMap() {
  map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom : 13,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP
    }
  });

  //Variables for ControlPosition and Autocomplete.
  var news = document.getElementById('news_container');
  var input = document.getElementById('search_place');
  var infoWindow = new google.maps.InfoWindow({map: map});
  var autocomplete = new google.maps.places.Autocomplete(input);

  //Pushing news Stand to the top right of the screen.
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(news);
  autocomplete.bindTo('bounds', map);

  //Creating Marker for the anchorPoint.
  var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
  });

  //Autocomplete added to the search input.
  autocomplete.addListener('place_changed', function() {
    //Initialing closing it.
      infoWindow.close();
      marker.setVisible(false);

      var place = autocomplete.getPlace();
      if (!place.geometry) {
          window.alert("Autocomplete's returned place contains no geometry");
          return;
      }
      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
      } else {
          map.setCenter(place.geometry.location);
          map.setZoom(13);
      }

      //Set the marker with the given attributes.
      marker.setIcon(/** @type {google.maps.Icon} */({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
      }));

      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      var address = '';
      if (place.address_components) {
          address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
      }
      //infoWindow updated with the Place name
      infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infoWindow.open(map, marker);
  });

  //Geolocation Feature added.
  var status ;
  $('#id-name--1').change(function() {
  status = $('#id-name--1').prop("checked");
  //If status is true.
  if(status){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        //get the lat, lng coordinates of the current device.
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        //Updating the infoWindow that is location is found.
        infoWindow.setPosition(pos);
        infoWindow.setContent('Location found.');
        map.setCenter(pos);
        },
        function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
    }
    else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }
  //Default location if the status is false
  else {
    var pos = {
      lat: 40.7413549,
      lng: -73.9980244
    };

    infoWindow.setPosition(pos);
    infoWindow.setContent('New York City');
    map.setCenter(pos);
  }
  }).change();

}

//Error function if the geo location function fails to track the position of the device.
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
}

//jQuery functions to toggle classes for effects.
$('.nav-icon').click(function(){
  $(this).toggleClass('open');
});

$('.slide1').click(function() {
  $('#slide-menu').toggleClass('menu-active');
});

$('.slide2').click(function(){
  $('#slide-menu_right').toggleClass('menu-active');
});

//Knockout ViewModel
function AppViewModel() {
  //Initial observable
  var self = this;
  self.filter = ko.observable('');

  //Class for locations.
  function known_places(title, location) {
    var self = this;
    self.title = title;
    self.location = location;
    self.show = function() {
      var geocoder = new google.maps.Geocoder();
      var location = self.location;

      if(location == ' ') {
        window.alert('You must enter an area, or address.');
      }
      else {
        geocoder.geocode(
            { location: location,
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  map.setCenter(results[0].geometry.location);
                  map.setZoom(15);
                } else {
                  window.alert('We could not find that location - try entering a more' +
                      ' specific place.');
                }
              });
      }
    };
  };

  //observableArray adding instances of the known_places class.
  self.store_address = ko.observableArray([
    new known_places("Park Ave Penthouse",{lat: 40.7713024, lng: -73.9632393}),
    new known_places("Chelsea Loft",{lat: 40.7444883, lng: -73.9949465}),
    new known_places("Union Square Open Floor Plan",{lat: 40.7347062, lng: -73.9895759}),
    new known_places("East Village Hip Studio",{lat: 40.7281777, lng: -73.984377}),
    new known_places("TriBeCa Artsy Bachelor Pad",{lat: 40.7195264, lng: -74.0089934}),
    new known_places("Chinatown Homey Space",{lat: 40.7180628, lng: -73.9961237})
  ]);

  //Computed function for filter the locations in list.
  self.filteredItems = ko.computed(function() {
    var filter = self.filter();
    if (!filter) { return self.store_address(); }
    return self.store_address().filter(function(i) {
       return i.title.indexOf(filter) > -1; });
  })

  //function to sent the markers and infowindows to the saved location.
  self.mark = function() {
    self.largeInfowindow = new google.maps.InfoWindow();
    //goes through all the stored addresses
    for (var i = 0; i < self.store_address().length; i++) {
        // Get the position from the location array.
        self.position = self.store_address()[i].location;
        self.title = self.store_address()[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: self.position,
            title: self.title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        //Adding click event to each of the marker.
        marker.addListener('click', function() {
        self.populateInfoWindow(this, self.largeInfowindow);
        });
    }
  };

  //function to zoom to the loaction on the search input.
  self.zoom = function(address) {
    //uses google API geocoder
    var geocoder = new google.maps.Geocoder();
    var address = $("#search_place").val();

    if(address == ' ') {
      window.alert('You must enter an area, or address.');
    }
    else {
      geocoder.geocode(
          { address: address,
          }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              map.setCenter(results[0].geometry.location);
              map.setZoom(15);
            } else {
              window.alert('We could not find that location - try entering a more' +
                    ' specific place.');
              }
            });
      }
  };

  //Function exicute when the set marker is clicked and puts a marker on the location
  //and pushes the location to the loaction array.
  self.storeaddr = function() {
    var geocoder = new google.maps.Geocoder();
    var address = $("#search_place").val();
    self.largeInfowindow = new google.maps.InfoWindow();
    if(address == ' ') {
      window.alert('You must enter an area, or address.');
    } else {
      //Uses geocoding to track down the address.
      geocoder.geocode(
        { address: address,
        }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          //Sets a marker for the address.
            var marker = new google.maps.Marker({
            map:map,
            position: results[0].geometry.location,
            title: address,
            animation: google.maps.Animation.DROP,
            id: count,
            });
            //Adds a InfoWindow.
            marker.addListener('click', function() {
            self.populateInfoWindow(this, self.largeInfowindow);
            });
            //pushes it to the location array.
            self.store_address.push(new known_places(address,results[0].geometry.location));
            //Increases the count for the ID.
            count = count +1;
          }
          else {
            window.alert('We could not find that location - try entering a more' +
                ' specific place.');
          }
        });
      }
  };

  //Function used to add content to the infowindow of the markers.
  self.populateInfoWindow = function(marker, infowindow) {
    var $news = $('#news');
    var $news_header = $('#news_header');
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
        });
        //set it up with the image and the place name.
        infowindow.setContent('<div class="place_title">' + marker.title + '</div>' + '<img class="bgimg" src="https://maps.googleapis.com/maps/api/streetview?size=500x300&location=' +marker.position.lat() +','+marker.position.lng()+'&fov=90&heading=235&pitch=10 &key=AIzaSyDGzY7uuAXgqbzLzr15kz7o4DVRVCPlC3Q&v=3">');
        }

    infowindow.open(map, marker);
    $news.text("");

    //Forms the URL for New York Times API for the perticular location.
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
    'q' : marker.title,
    'api-key': "1fabcf73aa33430db64ff29eca489e43"
      });

      //Sends a AJAX request to get the JSON value back.
    $.getJSON(url,function(data) {
        $news_header.text('New YorkTimes Article About ' + marker.title);
        articles = data.response.docs;
        for(var i = 0;i < articles.length ;i++) {
        var article = articles[i];
        if(article.snippet != null) {
          //Appends the JSON value in the UL tag.
            $news.append('<li class="article">'+
                        '<a href="' + article.web_url+'">'+article.headline.main+'</a>'
                        +'<p>'+article.snippet+'</p>'+
                          '</li>');
          }
        };
        //If fails
      }).fail(function(e) {
      $news_header.text('New York Times Article Could Not be Loaded');
  });
};
}

//Knockout is applied to the page.
var knock = new AppViewModel();
ko.applyBindings(knock);
