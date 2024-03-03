const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());

morgan.token("person", function (req, res) {
  return req.body.name && req.body.number ? JSON.stringify(req.body) : null;
});

app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :person"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

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
  response.status(200).json(persons);
});

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

app.get("/info", (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people<br/>${getDate()}`);
});

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
  if (persons.find((p) => p.name === name)) {
    response.status(400).json({ error: "name must be unique" });
    return;
  }

  let person = {
    id: getId(),
    name: name,
    number: number,
  };

  if (person.id === -1) {
    response.status(400).json({ error: "too many entries in the phonebook" });
    return;
  }

  persons = persons.concat(person);

  response.status(201).json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}\nAccess here: http://localhost:3001/info`);
});
