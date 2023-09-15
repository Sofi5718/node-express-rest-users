import express from "express";
import fs from "fs/promises";
import cors from "cors";
import { connection } from "./database.js";

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json()); // To parse JSON bodies
app.use(cors()); // Enable CORS for all routes

app.get("/", (request, response) => {
  response.send("Node.js Users REST API 🎉");
});

async function getUsersFromJSON() {
  const data = await fs.readFile("data.json");
  const users = JSON.parse(data);
  users.sort((userA, userB) => userA.name.localeCompare(userB.name));
  return users;
}

// READ all users
app.get("/users", async (request, response) => {
  const query = "SELECT * from `users`";
  connection.query(query, function (err, result, fields) {
    if (err) {
      console.log(err);
    } else {
      response.json(result);
    }
  });
});

// READ one user
app.get("/users/:id", async (request, response) => {
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const query = "SELECT * from `users` WHERE id=?;";
  const value = [id];

  connection.query(query, value, function (err, result, fields) {
    if (err) {
      console.log(err);
    } else {
      response.json(result[0]);
    }
  });
  const users = await getUsersFromJSON();
  const user = users.find((user) => user.id === id);
  response.json(user);
});

// CREATE user
app.post("/users", async (request, response) => {
  const newUser = request.body;
  const query = "INSERT INTO users (image, name, mail, title) values(?,?,?,?);";
  const values = [newUser.image, newUser.name, newUser.mail, newUser.title];

  connection.query(query, values, function (err, result, fields) {
    if (err) {
      console.log(err);
    } else {
      response.json(result);
    }
  });
});

// UPDATE user
app.put("/users/:id", async (request, response) => {
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const updateUser = request.body;
  const query = "UPDATE users SET image=?, name=?, mail=?, title=? WHERE id=?;";
  const values = [updateUser.image, updateUser.name, updateUser.mail, updateUser.title, id];

  connection.query(query, values, function (err, result, fields) {
    if (err) {
      console.log(err);
    } else {
      response.json(result);
    }
  });
});

// DELETE user
app.delete("/users/:id", async (request, response) => {
  const id = request.params.id; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const users = await getUsersFromJSON();
  // const newUsers = users.filter(user => user.id !== id);
  const index = users.findIndex((user) => user.id === id);
  users.splice(index, 1);
  fs.writeFile("data.json", JSON.stringify(users));
  response.json(users);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(`App listening on http://localhost:${port}`);
  console.log(`Users Endpoint http://localhost:${port}/users`);
});
