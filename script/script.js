var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom : 13
  });

}

$('#nav-icon').click(function(){
  $(this).toggleClass('open');
  $('#slide-menu').toggleClass('menu-active');
});
