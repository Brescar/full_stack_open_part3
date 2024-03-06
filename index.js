require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person.js");

const app = express();

morgan.token("person", function (req, res) {
  return req.body.name && req.body.number ? JSON.stringify(req.body) : null;
});

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :person"));

function getDate() {
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZoneName: "longOffset",
  };

  const dateTimeFormat = new Intl.DateTimeFormat("en-US", options);
  const formattedDate = dateTimeFormat.format(new Date());

  return formattedDate;
}

function getId() {
  let id;
  for (let i = 0; i < 10; i++) {
    id = Math.floor(Math.random() * 10000);
    if (!persons.find((p) => p.id === id)) {
      break;
    }
    id = -1;
  }

  return id;
}

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => response.status(200).json(persons));
});

//below not working with the DB (not yet implemented)
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  console.log("request.params.id = ", request.params.id);
  console.log("id = ", id);
  const person = persons.find((p) => p.id === id);
  console.log("person = ", person);
  if (person) {
    response.status(200).json(person);
  } else {
    response.status(404).end();
  }
});

//below not working with the DB (not yet implemented)
app.get("/info", (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people<br/>${getDate()}`);
});

//below not working with the DB (not yet implemented)
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const name = request.body.name;
  const number = request.body.number;
  if (!name) {
    response.status(400).json({ error: "name is missing" });
    return;
  }
  if (!number) {
    response.status(400).json({ error: "number is missing" });
    return;
  }
  //below not working with the DB (not yet implemented)
  // if (persons.find((p) => p.name === name)) {
  //   response.status(400).json({ error: "name must be unique" });
  //   return;
  // }

  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((savedPerson) => response.status(201).json(savedPerson));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}\n`);
});
