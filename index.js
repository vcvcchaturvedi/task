const Express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const firebase = require("firebase/app");
const auth = require("firebase/auth");
const database = require("firebase/database");
const app = Express();
const port = process.env.PORT || 3200;
app.use(cors());
app.use(Express.json());
app.use(
  Express.urlencoded({
    extended: true,
  })
);
const dataFromFile = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, {
    encoding: "utf-8",
    flag: "r",
  })
);
dotenv.config({ path: "./config.env" });
firebase.initializeApp(JSON.parse(process.env.FBCONFIG));

// Get a reference to the database service
var databaseFB = firebase.database();

//Read all users from DB Route
app.get("/usersDB", async (req, res) => {
  try {
    const dbRef = databaseFB.ref();
    dbRef
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          //console.log(snapshot.val());
          return res.send({ status: "success", message: snapshot.val() });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
        return res.send({
          status: "failure",
          message: "Error in loading data...",
        });
      });

    //testusers-81047-default-rtdb
  } catch (err) {
    res.send({
      status: "failure",
      message: "Error in getting data from DB...",
    });
  }
});
app.patch("/userDB/:id", async (req, res) => {
  try {
    const dbRef = databaseFB.ref();
    let updateFlag = false;

    dbRef
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          //   let array2 = snapshot.val();
          //   let array1 = [...array2];
          let foundID = false;
          for (let i = 0; i < snapshot.val().length; i++) {
            console.log(
              JSON.stringify(snapshot.val()[i]) + ".......\n" + req.params.id
            );
            if (snapshot.val()[i]._id == req.params.id) {
              if (req.body.name && req.body.name != snapshot.val()[i].name) {
                snapshot.val()[i] = {
                  ...snapshot.val()[i],
                  name: req.body.name,
                };
                updateFlag = true;
              }
              if (req.body.email && req.body.email != snapshot.val()[i].email) {
                snapshot.val()[i] = {
                  ...snapshot.val()[i],
                  email: req.body.email,
                };
                updateFlag = true;
              }
              if (req.body.role && req.body.role != snapshot.val()[i].role) {
                snapshot.val()[i] = {
                  ...snapshot.val()[i],
                  role: req.body.role,
                };
                updateFlag = true;
              }
              if (
                req.body.active !== "undefined" &&
                req.body.active != snapshot.val()[i].active
              ) {
                snapshot.val()[i] = {
                  ...snapshot.val()[i],
                  active: req.body.active,
                };
                updateFlag = true;
              }
              if (req.body.photo && req.body.photo != snapshot.val()[i].photo) {
                snapshot.val()[i] = {
                  ...snapshot.val()[i],
                  photo: req.body.photo,
                };
                updateFlag = true;
              }
              if (
                req.body.password &&
                req.body.password != snapshot.val()[i].password
              ) {
                snapshot.val()[i] = {
                  ...snapshot.val()[i],
                  password: req.body.password,
                };
                updateFlag = true;
              }
              foundID = true;
              break;
            }
            console.log(JSON.stringify(snapshot.val()[i]) + "---------\n");
            if (!foundID)
              return res.send({
                status: "failure",
                message: "No such user exists!",
              });
          }
          if (updateFlag) {
            databaseFB
              .ref()
              .update(snapshot.val())
              .then(() => {
                return res.send({ status: "success", message: "Done" });
              })
              .catch((err) => {
                console.log(err);
                return res.send({
                  status: "failure",
                  message: "Error in updating the user...",
                });
              });
          } else
            return res.send({
              status: "success",
              message: "No alterations done in DB...",
            });
        }
      })
      .catch((error) => {
        console.error(error);
        return res.send({
          status: "failure",
          message: "Error in loading data",
        });
      });
  } catch (err) {
    console.log(err);
    res.send({ status: "failure", message: "Error in loading data" });
  }
});
app.post("/usersDB", async (req, res) => {
  let reqData = req.body;
  if (
    !reqData.name ||
    !reqData.email ||
    !reqData.role ||
    reqData.active === "undefined" ||
    !reqData.photo ||
    !reqData.password
  )
    return res.send({
      status: "failure",
      message:
        "One or more fields missing in request body to successfully add the user to File...",
    });
  else {
    reqData._id = Date.now();
    databaseFB
      .ref()
      .push()
      .set(reqData)
      .then(() => {
        return res.send({ status: "success", message: "Saved data in DB..." });
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: "failure",
          message: "Unable to save data in DB...",
        });
      });
  }
});
app.get("/hello", async (req, res) => {
  res.send({ status: "success", data: {} });
});

app.get("/users", async (req, res) => {
  res.send({ status: "success", data: dataFromFile });
});
app.patch("/user/:id", async (req, res) => {
  try {
    if (req.params.id) {
      console.log(req.body);
      let updateFlag = false;
      let foundID = false;
      for (let i = 0; i < dataFromFile.length; i++) {
        if (dataFromFile[i]._id == req.params.id) {
          foundID = true;
          if (req.body.name && req.body.name != dataFromFile[i].name) {
            dataFromFile[i] = { ...dataFromFile[i], name: req.body.name };
            updateFlag = true;
          }
          if (req.body.email && req.body.email != dataFromFile[i].email) {
            dataFromFile[i] = { ...dataFromFile[i], email: req.body.email };
            updateFlag = true;
          }
          if (req.body.role && req.body.role != dataFromFile[i].role) {
            dataFromFile[i] = { ...dataFromFile[i], role: req.body.role };
            updateFlag = true;
          }
          if (
            req.body.active !== "undefined" &&
            req.body.active != dataFromFile[i].active
          ) {
            dataFromFile[i] = { ...dataFromFile[i], active: req.body.active };
            updateFlag = true;
          }
          if (req.body.photo && req.body.photo != dataFromFile[i].photo) {
            dataFromFile[i] = { ...dataFromFile[i], photo: req.body.photo };
            updateFlag = true;
          }
          if (
            req.body.password &&
            req.body.password != dataFromFile[i].password
          ) {
            dataFromFile[i] = {
              ...dataFromFile[i],
              password: req.body.password,
            };
            updateFlag = true;
          }
          break;
        }
      }
      if (updateFlag) {
        fs.writeFile(
          `${__dirname}/users.json`,
          JSON.stringify(dataFromFile),
          (err) => {
            if (err)
              res.send({
                status: "failure",
                message: "Unable to write to file...",
              });
            else res.send({ status: "success" });
          }
        );
        return;
      } else {
        if (!foundID)
          return res.send({ status: "failure", message: "No such user!" });
        res.send({
          status: "success",
          message: "No data overwritten in file...",
        });
      }
    } else {
      return res.send({
        status: "failure",
        message: "Please choose an ID for updating the user",
      });
    }
  } catch (err) {
    console.log("Error while handling request: " + err);
  }
});
app.post("/users", async (req, res) => {
  let reqData = req.body;
  if (
    !reqData.name ||
    !reqData.email ||
    !reqData.role ||
    reqData.active === "undefined" ||
    !reqData.photo ||
    !reqData.password
  )
    return res.send({
      status: "failure",
      message:
        "One or more fields missing in request body to successfully add the user to File...",
    });
  else {
    reqData._id = Date.now();
    dataFromFile.push(reqData);
    fs.writeFile(
      `${__dirname}/users.json`,
      JSON.stringify(dataFromFile),
      (err) => {
        if (err)
          res.send({
            status: "failure",
            message: "Unable to write to file...",
          });
        else res.send({ status: "success" });
      }
    );
  }
});
app.listen(port, () => console.log(`Listening on ${port}`));
