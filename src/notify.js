const https = require("https");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const emailpath = path.join(__dirname + "../../views/email.ejs");

var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0");
var yyyy = today.getFullYear();
today = dd + "-" + mm + "-" + yyyy;

// sending email to all registered users

var MongoClient = require("mongodb").MongoClient;
const { gmail } = require("googleapis/build/src/apis/gmail");
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("vaccineDB");
  var users;
  dbo
    .collection("users")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      users = result;

      db.close();

      users.sort(function (a, b) {
        return a.district - b.district;
      });

      let i = 0;
      let prev_d;
      let prev_res;
      let results;

      users.forEach((element) => {
        var name = element.name;
        var district_id = element.district;
        var email = element.email;

        var url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${today}`;

        if (i == 0) {

          https
            .get(url, (resp) => {
              let data = "";

              // A chunk of data has been received.
              resp.on("data", (chunk) => {
                data += chunk;
              });

              // The whole response has been received
              resp.on("end", () => {
                results = JSON.parse(data);

                prev_res = results;
                prev_d = district_id;

                sendEmail(results, email, name);
              });
            })
            .on("error", (err) => {
              console.log("Error: " + err.message);
            });
        } else if (district_id == prev_d) {
          sendEmail(prev_res, email, name);
        } else {

          https
            .get(url, (resp) => {
              let data = "";

              // A chunk of data has been received.
              resp.on("data", (chunk) => {
                data += chunk;
              });

              // The whole response has been received
              resp.on("end", () => {
                results = JSON.parse(data);

                prev_res = results;
                prev_d = district_id;

                sendEmail(results, email, name);
              });
            })
            .on("error", (err) => {
              console.log("Error: " + err.message);
            });
        }

        i += 1;
      });
    });
});

function sendEmail(res, email, name) {
  const oauth2Client = new OAuth2(
    "490094031883-8ohbu2lnk0kc2iqi40trk9e7fc2lei2a.apps.googleusercontent.com", // ClientID
    "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", // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
  );

  oauth2Client.setCredentials({
    refresh_token:
      "1//04LZWNRO9mjfyCgYIARAAGAQSNwF-L9Ir5vGKrxOh079ecVoaBNzLm9RIi3b5VsuROJLapcguR3CH7SrE5_OnuEjO_Gp-VvHlRIg",
  });
  const accessToken = oauth2Client.getAccessToken();

  // sending email using Nodemailer

  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "soumya.agarwal2002@gmail.com",
      clientId:
        "490094031883-8ohbu2lnk0kc2iqi40trk9e7fc2lei2a.apps.googleusercontent.com",
      clientSecret: "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",
      refreshToken:
        "1//04LZWNRO9mjfyCgYIARAAGAQSNwF-L9Ir5vGKrxOh079ecVoaBNzLm9RIi3b5VsuROJLapcguR3CH7SrE5_OnuEjO_Gp-VvHlRIg",
      accessToken: accessToken,
    },
  });

  ejs.renderFile(
    emailpath,
    { vdata: res.centers, username: name },
    async function (err, data) {
      if (err) {
        console.log(err);
      } else {
        const mailOptions = {
          from: "soumya.agarwal2002@gmail.com",
          to: email,
          subject: "Vaccine Centres at your location",
          generateTextFromHTML: true,
          html: await data,
          attachments: [
            {
              filename: "eimg.png",
              path: __dirname + "../../public/css/eimg.png",
              cid: "img",
            },
          ],
        };

        smtpTransport.sendMail(mailOptions, (error, response) => {
          error ? console.log(error) : console.log(response);
          smtpTransport.close();
        });
      }
    }
  );
}
