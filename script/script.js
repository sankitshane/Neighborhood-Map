
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
      position: google.maps.ControlPosition.LEFT_TOP
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP
    }
  });
  //Variables for ControlPosition and Autocomplete.
  var news_button = document.getElementById('news_button');
  var news = document.getElementById('news_container');
  var input = document.getElementById('search_place');
  var infoWindow = new google.maps.InfoWindow({map: map});
  var autocomplete = new google.maps.places.Autocomplete(input);

  //Pushing news Stand to the top right of the screen.
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(news_button);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(news);
  autocomplete.bindTo('bounds', map);

  //Creating Marker for the anchorPoint.
  var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
  });
  infoWindow.close();
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

}

//Error function if the geo location function fails to track the position of the device.
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
}

function ErrorMapLoading() {
  var body = window.document.getElementById('map');
  body.innerHTML = '<div id="error"><h2>Due to some ERROR, Google Maps API is not fetching data.Please check google Ajax request.</h2></div>';
}


//Knockout ViewModel
function AppViewModel() {
  //Initial observable
  var self = this;
  var infoWindow;
  var d_count= 0 ;
  self.filter = ko.observable('');
  self.search_area = ko.observable('');
  self.$news = ko.observableArray([]);
  self.$news_header = ko.observable();
  self.newClass = ko.observable(false);
  self.newClass_new = ko.observable(false);
  self.check = ko.observable(true);
  this.isChecked = ko.observable(true);
  this.geoisChecked = ko.observable(false);
  this.geoCheck = ko.observable(false);
  self.marker = [];

  var toggleBounce = function(marker) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
      marker.setAnimation(null);
    }, 1400);
};

  self.makeitwork = function() {
    if(self.newClass() === false){self.newClass(true);}
    else {self.newClass(false);}
  };

  self.makeitwork_new = function() {
    if(self.newClass_new() === false){self.newClass_new(true);}
    else{self.newClass_new(false);}
  };

  self.makeitwork_check = function() {
    if(self.check() === false){self.check(true);}
    else{self.check(false);}
  };

  this.isChecked.subscribe(function(){
        this.makeitwork_check();
    }, this);


//Geolocation Feature added.
  self.geolocate = function() {
    d_count++;
    if(d_count === 1){infoWindow = new google.maps.InfoWindow({map: map});}
    infoWindow.addListener('closeclick', function() {
      d_count = 0;
    });
    if(self.geoCheck() === false){self.geoCheck(true);}
    else{self.geoCheck(false);}

    if(self.geoCheck()){
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
    } else {
      var pos = {
        lat: 40.7413549,
        lng: -73.9980244
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('New York City');
      map.setCenter(pos);

    }

  };
  this.geoisChecked.subscribe(function(){
        this.geolocate();
    }, this);

  //Class for locations.
  function known_places(title, location) {
    var self = this;
    self.theone = 0;
    self.open = 0;
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
              for(var i=0;i<results.length ; i++){
                if(results[i].address_components[0].long_name[0] === self.title[0]){
                  self.theone = i;
                  break;
                }
              }
                if (status == google.maps.GeocoderStatus.OK) {
                  map.setCenter(results[self.theone].geometry.location);
                  map.setZoom(15);

                  var marker = new google.maps.Marker({
                      map: map,
                      position: self.location,
                      title: self.title
                  });

                  toggleBounce(marker);
                  var infowindow = new google.maps.InfoWindow({
                      content: '<div class="place_title">' + results[self.theone].formatted_address + '</div>'
                    });
                    if(self.open === 0) {
                    infowindow.open(map, marker);
                    self.open++;
                  }
                } else {
                  window.alert('We could not find that location - try entering a more' +
                      ' specific place.');
                }
              });
      }
    };
  }

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
    var i;
    for(i =0 ; i < self.marker.length ; i++){
      self.marker[i].setMap(null);
    }
    var filter = self.filter();
    if (!filter) {
      for(i =0 ; i < self.marker.length ; i++) {
        self.marker[i].setMap(map);
      }
       return self.store_address()
    }
    var fil_addr = self.store_address().filter(function(i) {
       return (i.title.indexOf(filter)) > -1; });
       for(i =0 ; i < fil_addr.length ; i++) {
         for(var j =0 ; j < self.marker.length ; j++){
           if(self.marker[j].title === fil_addr[i].title) {
             self.marker[j].setMap(map);
           }
         }
       }
       return fil_addr;
  });

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
        self.marker.push(marker);
        //Adding click event to each of the marker.
        marker.addListener('click', function() {
        toggleBounce(this);
        self.populateInfoWindow(this, self.largeInfowindow);
        });

    }
  };

  //function to zoom to the loaction on the search input.
  self.zoom = function(address_zoom) {
    //uses google API geocoder
    var geocoder = new google.maps.Geocoder();
    var address = self.search_area();

    if(address == ' ') {
      window.alert('You must enter an area, or address.');
    }
    else {
      geocoder.geocode(
          { address: address_zoom,
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
    var address = self.search_area();
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
            toggleBounce(this);
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
    var screen_width;
    var screen_height;
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
        marker.setAnimation(null);
        infowindow.marker = null;
        });
        //set it up with the image and the place name.
        if(window.innerWidth > 650) {
        screen_width = Math.floor(window.innerWidth/3);
        screen_height = Math.floor(window.innerHeight/3);
      }else {
        screen_width = 250;
        screen_height = 198;
      }
      if(window.innerWidth > 350){
        infowindow.setContent('<div class="place_title">' + marker.title + '</div>' + '<img class="bgimg" src="https://maps.googleapis.com/maps/api/streetview?size='+ screen_width +'x'+ screen_height +'&location=' +marker.position.lat() +','+marker.position.lng()+'&fov=90&heading=235&pitch=10 &key=AIzaSyDGzY7uuAXgqbzLzr15kz7o4DVRVCPlC3Q&v=3">');
      }else {
        infowindow.setContent('<div class="place_title">' + marker.title + '</div>');
      }
        }

    infowindow.open(map, marker);
    self.$news("");

    //Forms the URL for New York Times API for the perticular location.
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
    'q' : marker.title,
    'api-key': "1fabcf73aa33430db64ff29eca489e43"
      });

      //Sends a AJAX request to get the JSON value back.
    $.getJSON(url,function(data) {
        self.$news_header('New YorkTimes Article About ' + marker.title);
        articles = data.response.docs;
        var new_articles = [];
        for(var i = 0;i < articles.length ;i++) {
        var article = articles[i];
        if(article.snippet !== null) {
          //Appends the JSON value in the UL tag.

            new_articles.push('<li class="article">'+
                       '<a href="' + article.web_url+'">'+article.headline.main+'</a>' +'<p>'+article.snippet+'</p>'+
                       '</li>');
          }
        }
        self.$news(new_articles);
        //If fails
      }).fail(function(e) {
      self.$news_header('New York Times Article Could Not be Loaded');
  });

};

}

//Knockout is applied to the page.
var knock = new AppViewModel();
ko.applyBindings(knock);
