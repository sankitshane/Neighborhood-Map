var map;
var count = 0;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom : 13
  });
  var infoWindow = new google.maps.InfoWindow({map: map});
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

$('#nav-icon').click(function(){
  $(this).toggleClass('open');
  $('#slide-menu').toggleClass('menu-active');
});

function AppViewModel() {
  this.searchPlace = function() {
    var geocoder = new google.maps.Geocoder();
    var address = $("#place").val();

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
  }
}

ko.applyBindings(new AppViewModel);
