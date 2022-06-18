var latitude, longitude, pincode;

var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0");
var yyyy = today.getFullYear();

today = dd + "-" + mm + "-" + yyyy;

// get user current location

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
}

// fetching current vaccine centers data through API using user geolocation

function showPosition(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  console.log(latitude);
  console.log(longitude);

  getData();

  async function getData() {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=b21480c0486c458187bc9474525d6e1b`
    );
    const data = await response.json();
    // console.log(data);
    pincode = data.results[0].components.postcode;

    var state = data.results[0].components.state;
    var district = data.results[0].components.state_district;
    var town = data.results[0].components.town;
    console.log(pincode);

    const resp = await fetch(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${today}`
    );
    var vaccine_data = await resp.json();
    vaccine_data = vaccine_data.sessions;
    console.log(vaccine_data);

    document.getElementById("place-name").innerHTML +=
      (town || district) + " " + "," + " " + state;

    if (vaccine_data.length == 0) {
      document.getElementById(
        "display-data"
      ).innerHTML = `<div class="no_data">No Vaccine Centres avialable currently !</div>`;
    } else {
      vaccine_data.forEach((ele) => {
        var centre_name = ele.name;
        var address =
          ele.address[0] +
          ele.address.substr(1).toLowerCase() +
          "," +
          ele.state_name;
        var age;
        if (ele.min_age_limit == 18) {
          age = "18+";
        } else {
          age = "15+";
        }
        var doses = ele.available_capacity;
        var avialable = ele.fee_type;
        var vaccine = ele.vaccine;

        // displaying all the available vaccine centers in user location

        var x = document.createElement("div");
        x.className = "data";
        x.innerHTML = `
            <div class="centre_name">${centre_name}</div>
            <div class="address">${address}</div>
            <div class="vaccine">${vaccine}</div>
            <div style="margin-top: 0.5rem;"><span class="age">Age : ${age}</span>  <span class="doses">Doses : ${doses}</span></div>
            <div class="avialable">Aviability : ${avialable}</div>`;

        document.getElementById("display-data").appendChild(x);
      });
    }
  }
}
getLocation();
