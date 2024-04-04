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

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.status(200).json(person);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.send(`Phonebook has info for ${people.length} people<br/>${getDate()}`);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing" });
  }
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

  const person = new Person({
    name: name,
    number: number,
  });

  person
    .save()
    .then((savedPerson) => response.status(201).json(savedPerson))
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((result) => {
      response.status(200).send(result);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.log(error);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id " });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}\n`);
});
