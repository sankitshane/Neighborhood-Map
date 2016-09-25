var map;
var count = 0;


function initMap() {
  map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom : 13
  });

  var input = document.getElementById('search_place');
  var infoWindow = new google.maps.InfoWindow({map: map});
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
  });



  autocomplete.addListener('place_changed', function() {
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

          infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
          infoWindow.open(map, marker);
        });

  var status ;
  $('#id-name--1').change(function() {
  status = $('#id-name--1').prop("checked");
  if(status){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

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

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
}

$('.nav-icon').click(function(){
  $(this).toggleClass('open');
});

$('.slide1').click(function() {
  $('#slide-menu').toggleClass('menu-active');
});

$('.slide2').click(function(){
  $('#slide-menu_right').toggleClass('menu-active');
});

function known_places(title, location) {
  var self = this;
  self.title = title;
  self.location = location;
}

function AppViewModel() {
  var self = this;
  self.filter = ko.observable('');

  self.store_address = ko.observableArray([
    new known_places("Park Ave Penthouse",{lat: 40.7713024, lng: -73.9632393}),
    new known_places("Chelsea Loft",{lat: 40.7444883, lng: -73.9949465}),
    new known_places("Union Square Open Floor Plan",{lat: 40.7347062, lng: -73.9895759}),
    new known_places("East Village Hip Studio",{lat: 40.7281777, lng: -73.984377}),
    new known_places("TriBeCa Artsy Bachelor Pad",{lat: 40.7195264, lng: -74.0089934}),
    new known_places("Chinatown Homey Space",{lat: 40.7180628, lng: -73.9961237})
  ]);

  self.filteredItems = ko.computed(function() {
    var filter = self.filter();
    if (!filter) { return self.store_address(); }
    return self.store_address().filter(function(i) {
       return i.title.indexOf(filter) > -1; });
  })

  self.mark = function() {
    for (var i = 0; i < self.store_address().length; i++) {
            // Get the position from the location array.
            var position = self.store_address()[i].location;
            var title = self.store_address()[i].title;
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
              map: map,
              position: position,
              title: title,
              animation: google.maps.Animation.DROP,
              id: i
            });
  }
};

  self.zoom = function() {
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

  self.storeaddr = function() {
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
            var marker = new google.maps.Marker({
            map:map,
            position: results[0].geometry.location,
            title: address,
            animation: google.maps.Animation.DROP,
            id: count
            });
            self.store_address.push(new known_places(address,results[0].geometry.location));
            count = count +1;
          }
          else {
            window.alert('We could not find that location - try entering a more' +
                ' specific place.');
          }
        });
        }

  };
}

ko.applyBindings(new AppViewModel);
