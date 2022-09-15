//locations data for places to be shown on map
var placesData = [{
        title: 'Bhopal',
        location: {
            lat: 23.2599,
            lng: 77.4126
        },
        show: true,
        selected: false,
        venueId: '4d402101c1d4721e308c0dc7'
    },
    {
        title: 'Sanchi-stupa',
        location: {
            lat: 23.479223,
            lng: 77.739683
        },
        show: true,
        selected: false,
        venueId: '4d74797ded838cfa1bb20e6b'
    },
    {
        title: 'Kanha Tiger Reserve',
        location: {
            lat: 22.3345,
            lng: 80.6115
        },
        show: true,
        selected: false,
        venueId: '55cc6b39498e90ffbac5ebe9'
    },
    {
        title: 'Khajuraho',
        location: {
            lat: 24.8318,
            lng: 79.9199
        },
        show: true,
        selected: false,
        venueId: '4cea067ff3bda1431f9dc3e4'
    },
    {
        title: 'Pachmarhi',
        location: {
            lat: 22.4674,
            lng: 78.4346
        },
        show: true,
        selected: false,
        venueId: '4fab53ade4b0c83987fa7127'
    },
    {
        title: 'Ujjain',
        location: {
            lat: 23.1793,
            lng: 75.7849
        },
        show: true,
        selected: false,
        venueId: '4c943e2258d4b60c503d2729'
    },
    {
        title: 'Pench National Park',
        location: {
            lat: 21.7630,
            lng: 79.3391
        },
        show: true,
        selected: false,
        venueId: '514d3639e4b045df9b05318f'
    }
];


var model = function()

{

    var self = this;

    self.errorDisplay = ko.observable('');
    self.mapArray = [];

    for (var i = 0; i < placesData.length; i++) {
        var place = new google.maps.Marker({
            position: {
                lat: placesData[i].location.lat,
                lng: placesData[i].location.lng
            },
            map: map,
            title: placesData[i].title,
            show: ko.observable(placesData[i].show),
            selected: ko.observable(placesData[i].selected),
            venueid: placesData[i].venueId, // venue id used for foursquare
            animation: google.maps.Animation.DROP
        });

        self.mapArray.push(place);
    }

    // bouncing animation on click till 700ms
    self.Bounce = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 700);
    };

    //  A function adding API information within each marker
    self.addApiInfo = function(marker) {
        $.ajax({
            url: "https://api.foursquare.com/v2/venues/" + marker.venueid + '?client_id=CCZQELAVUD3U1YNBNR1WPDRUPFFPXZAERXL05QY24MMHINOS&client_secret=KT2BR1PYYPWSOVBZCY1V1AAVRITVZ0JZNZ0YLVBLP0ZQH3MM&v=20170208',
            dataType: "json",
            success: function(data) {
                // results are stored here for displaying likes and ratings if available
                var result = data.response.venue;

                // for adding likes and ratings within marker
                marker.likes = result.hasOwnProperty('likes') ? result.likes.summary : '';
                marker.rating = result.hasOwnProperty('rating') ? result.rating : '';
            },

            // for json error warning
            error: function(e) {
                self.errorDisplay("Foursquare data is unavailable. Please try again later.");
            }
        });
    };

    //function to add information about API to the markers
    var addMarkerInfo = function(marker) {

        //add API items to each marker
        self.addApiInfo(marker);

        //add the click event listener to marker
        marker.addListener('click', function() {
            //set this marker to the selected state

            self.setSelected(marker);
        });
    };

    //  iterate through mapArray and add marker api info  
    for (var i = 0; i < self.mapArray.length; i++) {
        addMarkerInfo(self.mapArray[i]);
    }

    // create a searchText for the input search field
    self.searchText = ko.observable('');


    //every keydown is called from input box
    self.filterList = function() {
        //variable for search text
        var currentText = self.searchText();
        infowindow.close();

        //list for user search
        if (currentText.length === 0) {
            self.setAllShow(true);
        } else {
            for (var i = 0; i < self.mapArray.length; i++) {
                // to check whether the searchText is there in the mapArray
                if (self.mapArray[i].title.toLowerCase().indexOf(currentText.toLowerCase()) > -1) {
                    self.mapArray[i].show(true);
                    self.mapArray[i].setVisible(true);
                } else {
                    self.mapArray[i].show(false);
                    self.mapArray[i].setVisible(false);
                }
            }
        }
        infowindow.close();
    };

    // to show all the markers
    self.setAllShow = function(marker) {
        for (var i = 0; i < self.mapArray.length; i++) {
            self.mapArray[i].show(marker);
            self.mapArray[i].setVisible(marker);
        }
    };
    // function to make all the markers unselected 
    self.setAllUnselected = function() {
        for (var i = 0; i < self.mapArray.length; i++) {
            self.mapArray[i].selected(false);
        }
    };

    self.currentLocation = self.mapArray[0];

    // function to make all the markers selected and show the likes and ratings

    self.setSelected = function(location) {
        self.setAllUnselected();
        location.selected(true);

        self.currentLocation = location;

        Likes = function() {
            if (self.currentLocation.likes === '' || self.currentLocation.likes === undefined) {
                return "Likes not available for this location";
            } else {
                return "Location has " + self.currentLocation.likes;
            }
        };
        // function to show rating and if not then no rating to display
        Rating = function() {
            if (self.currentLocation.rating === '' || self.currentLocation.rating === undefined) {
                return "Ratings not  available for this location";
            } else {
                return "Location is rated " + self.currentLocation.rating;
            }
        };

        var InfoWindow = "<h5>" + self.currentLocation.title + "</h5>" + "<div>" + Likes() + "</div>" + "<div>" + Rating() + "</div>";

        infowindow.setContent(InfoWindow);

        infowindow.open(map, location);
        self.Bounce(location);
    };
};