let ele;
window.onload = getstate();

// getting all the states in register form

async function getstate() {
  var response = await fetch(
    "https://cdn-api.co-vin.in/api/v2/admin/location/states"
  );
  var data = await response.json();
  var state = data.states;

  ele = document.getElementById("state");
  for (let i = 0; i < state.length; i++) {
    ele.innerHTML += `<option value='${state[i].state_id}'>${state[i].state_name}</option>`;
  }
}

// getting all districts corresponding to state selected

async function getdistrict() {
  var state_id = document.getElementById("state").value;
  var dele = document.getElementById("district");
  dele.innerHTML = `<option value=${""}>${"----District----"}</option>`;

  if (state_id != "") {
    var resp = await fetch(
      `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state_id}`
    );
    var ddata = await resp.json();
    var district = ddata.districts;

    for (let i = 0; i < district.length; i++) {
      dele.innerHTML += `<option value="${district[i].district_id}">${district[i].district_name}</option>`;
    }
  }
}
